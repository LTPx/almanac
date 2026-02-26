// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title IERC5192 - Minimal Soulbound Token Interface
 * @dev EIP-5192: https://eips.ethereum.org/EIPS/eip-5192
 * OpenZeppelin no incluye esta interfaz aún, se implementa manualmente.
 */
interface IERC5192 {
    /// @dev Emitido cuando un token se bloquea (soulbound)
    event Locked(uint256 tokenId);
    /// @dev Emitido cuando un token se desbloquea (tradeable)
    event Unlocked(uint256 tokenId);
    /// @dev Retorna true si el token está bloqueado (no transferible)
    function locked(uint256 tokenId) external view returns (bool);
}

/**
 * @title AlmanacCertificate
 * @dev Contrato de NFTs educativos con sistema de dual mint:
 *   - Token CERTIFICATE (ID par): soulbound permanente, prueba de compleción del curso
 *   - Token COLLECTIBLE (ID impar): inicia soulbound, convertible a tradeable con KYC
 *
 * Estándares implementados:
 *   - ERC-721: NFT estándar
 *   - ERC-2981: Royalties (solo en coleccionables)
 *   - ERC-5192: Soulbound interface
 *   - AccessControl: Roles granulares (ADMIN, MINTER, KYC)
 *   - UUPS: Proxy upgradeable
 */
contract AlmanacCertificate is
    ERC721URIStorageUpgradeable,
    ERC2981Upgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    IERC5192
{
    // =========================================================================
    // Roles
    // =========================================================================

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");

    // =========================================================================
    // Tipos
    // =========================================================================

    enum TokenType {
        CERTIFICATE, // ID par — soulbound permanente
        COLLECTIBLE  // ID impar — soulbound → tradeable con KYC
    }

    // =========================================================================
    // Estado
    // =========================================================================

    /// @notice Número máximo de pares a mintear (fijado en initialize, no cambia)
    uint256 public MAX_PAIRS;

    /// @notice Pares ya minteados
    uint256 public pairsMinted;

    /// @notice Indica si un coleccionable fue convertido a tradeable
    /// @dev Solo aplica a IDs impares (COLLECTIBLE)
    mapping(uint256 => bool) private _tradeable;

    // =========================================================================
    // Eventos
    // =========================================================================

    event DualMint(
        address indexed to,
        uint256 indexed certificateId,
        uint256 indexed collectibleId,
        address artistAddress,
        uint96 royaltyBps
    );

    event ConvertedToTradeable(uint256 indexed tokenId, address indexed approvedBy);

    // =========================================================================
    // Inicialización (proxy pattern)
    // =========================================================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Inicializa el contrato (llamado una vez vía proxy)
     * @param name_ Nombre de la colección, ej: "Almanac Certificates"
     * @param symbol_ Símbolo, ej: "ALMN"
     * @param maxPairs_ Número total de pares a mintear (supply fijo)
     * @param admin_ Dirección que recibe DEFAULT_ADMIN_ROLE, MINTER_ROLE y KYC_ROLE
     */
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint256 maxPairs_,
        address admin_
    ) external initializer {
        require(maxPairs_ > 0, "AlmanacCertificate: maxPairs must be > 0");
        require(admin_ != address(0), "AlmanacCertificate: admin cannot be zero address");

        __ERC721_init(name_, symbol_);
        __ERC721URIStorage_init();
        __ERC2981_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        MAX_PAIRS = maxPairs_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, admin_);
        _grantRole(KYC_ROLE, admin_);
    }

    // =========================================================================
    // Mint
    // =========================================================================

    /**
     * @notice Mintea un par de tokens: un certificado + un coleccionable
     * @dev Solo MINTER_ROLE. Ambos tokens van a la misma dirección `to`.
     * @param to Dirección del receptor (wallet del usuario)
     * @param certificateURI Metadata URI del certificado (IPFS)
     * @param collectibleURI Metadata URI del coleccionable (IPFS)
     * @param artistAddress Receptor de royalties del coleccionable
     * @param royaltyBps Porcentaje de royalties en basis points (500 = 5%)
     * @return certId Token ID del certificado (par)
     * @return collectId Token ID del coleccionable (impar)
     */
    function mintDual(
        address to,
        string calldata certificateURI,
        string calldata collectibleURI,
        address artistAddress,
        uint96 royaltyBps
    )
        external
        onlyRole(MINTER_ROLE)
        nonReentrant
        returns (uint256 certId, uint256 collectId)
    {
        require(pairsMinted < MAX_PAIRS, "AlmanacCertificate: max supply reached");
        require(to != address(0), "AlmanacCertificate: mint to zero address");
        require(artistAddress != address(0), "AlmanacCertificate: artist cannot be zero address");
        require(royaltyBps <= 1000, "AlmanacCertificate: royalty cannot exceed 10%");

        certId = pairsMinted * 2;
        collectId = pairsMinted * 2 + 1;
        pairsMinted++;

        // Mintear certificado (ID par)
        _mint(to, certId);
        _setTokenURI(certId, certificateURI);

        // Mintear coleccionable (ID impar) con royalties
        _mint(to, collectId);
        _setTokenURI(collectId, collectibleURI);
        _setTokenRoyalty(collectId, artistAddress, royaltyBps);

        emit Locked(certId);
        emit Locked(collectId);
        emit DualMint(to, certId, collectId, artistAddress, royaltyBps);
    }

    // =========================================================================
    // KYC — Conversión a tradeable
    // =========================================================================

    /**
     * @notice Convierte un coleccionable de soulbound a tradeable
     * @dev Solo KYC_ROLE. Solo aplica a IDs impares (coleccionables).
     *      El backend debe verificar el KYC off-chain antes de llamar esta función.
     * @param tokenId ID del coleccionable a convertir (debe ser impar)
     */
    function convertToTradeable(uint256 tokenId) external onlyRole(KYC_ROLE) {
        require(_ownerOf(tokenId) != address(0), "AlmanacCertificate: token does not exist");
        require(tokenId % 2 == 1, "AlmanacCertificate: only collectibles can be converted");
        require(!_tradeable[tokenId], "AlmanacCertificate: already tradeable");

        _tradeable[tokenId] = true;

        emit Unlocked(tokenId);
        emit ConvertedToTradeable(tokenId, msg.sender);
    }

    // =========================================================================
    // Transfer override — lógica soulbound
    // =========================================================================

    /**
     * @dev Override de _update para implementar restricciones de transferencia:
     *   - Certificados (ID par): NUNCA se transfieren (excepto mint desde address(0))
     *   - Coleccionables (ID impar): solo se transfieren si isTradeable == true
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Permitir mint (from == address(0)) y burn (to == address(0))
        if (from != address(0) && to != address(0)) {
            if (tokenId % 2 == 0) {
                // CERTIFICATE — soulbound permanente
                revert("AlmanacCertificate: certificates are permanently soulbound");
            } else {
                // COLLECTIBLE — soulbound hasta KYC
                require(_tradeable[tokenId], "AlmanacCertificate: complete KYC to enable trading");
            }
        }

        return super._update(to, tokenId, auth);
    }

    // =========================================================================
    // ERC-5192 — Soulbound interface
    // =========================================================================

    /**
     * @notice Retorna si el token está bloqueado (no transferible)
     * @param tokenId ID del token
     * @return true si es soulbound, false si es tradeable
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        require(_ownerOf(tokenId) != address(0), "AlmanacCertificate: token does not exist");

        if (tokenId % 2 == 0) {
            return true; // Certificado: siempre bloqueado
        }
        return !_tradeable[tokenId]; // Coleccionable: bloqueado hasta KYC
    }

    // =========================================================================
    // ERC-2981 — Royalties override
    // =========================================================================

    /**
     * @notice Retorna información de royalties
     * @dev Los certificados (ID par) no tienen royalties.
     *      Los coleccionables (ID impar) usan las royalties configuradas en mintDual.
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) public view override returns (address receiver, uint256 royaltyAmount) {
        if (tokenId % 2 == 0) {
            // CERTIFICATE — sin royalties
            return (address(0), 0);
        }
        // COLLECTIBLE — usa ERC-2981 estándar
        return super.royaltyInfo(tokenId, salePrice);
    }

    // =========================================================================
    // Funciones de consulta
    // =========================================================================

    /**
     * @notice Retorna el tipo de token (CERTIFICATE o COLLECTIBLE)
     */
    function tokenType(uint256 tokenId) external pure returns (TokenType) {
        return tokenId % 2 == 0 ? TokenType.CERTIFICATE : TokenType.COLLECTIBLE;
    }

    /**
     * @notice Retorna el ID del token hermano (el par del dual mint)
     */
    function pairedTokenId(uint256 tokenId) external pure returns (uint256) {
        if (tokenId % 2 == 0) {
            return tokenId + 1; // Certificado → su coleccionable
        }
        return tokenId - 1; // Coleccionable → su certificado
    }

    /**
     * @notice Retorna si un coleccionable es tradeable
     */
    function isTradeable(uint256 tokenId) external view returns (bool) {
        return _tradeable[tokenId];
    }

    /**
     * @notice Retorna el total de tokens minteados (pares * 2)
     */
    function totalSupply() external view returns (uint256) {
        return pairsMinted * 2;
    }

    /**
     * @notice Retorna cuántos pares quedan disponibles
     */
    function remainingPairs() external view returns (uint256) {
        return MAX_PAIRS - pairsMinted;
    }

    // =========================================================================
    // supportsInterface
    // =========================================================================

    /**
     * @dev Declara soporte para ERC-5192, ERC-2981, ERC-721, AccessControl.
     * interfaceId de ERC-5192: 0xb45a3c0e
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorageUpgradeable, ERC2981Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC5192).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // =========================================================================
    // UUPS — Autorización de upgrade
    // =========================================================================

    /**
     * @dev Solo DEFAULT_ADMIN_ROLE puede upgradear el contrato.
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}
}
