// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title IERC5192 - Minimal Soulbound Token Interface
 * @dev EIP-5192: https://eips.ethereum.org/EIPS/eip-5192
 */
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

/**
 * @title AlmanacCertificate
 * @dev Contrato de certificados educativos soulbound.
 *
 * Cada certificado es un NFT que:
 *   - Es soulbound permanente (no se puede transferir)
 *   - No se puede quemar
 *   - No tiene royalties (no se vende)
 *   - Tiene supply fijo (MAX_SUPPLY)
 *
 * El mint lo ejecuta el backend (MINTER_ROLE) pagando gas con la wallet admin/relayer.
 * El NFT se mintea directo a la wallet del usuario.
 *
 * Estándares: ERC-721, ERC-5192 (Soulbound), AccessControl, UUPS.
 */
contract AlmanacCertificate is
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    IERC5192
{
    // =========================================================================
    // Roles
    // =========================================================================

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // =========================================================================
    // Estado
    // =========================================================================

    /// @notice Número máximo de certificados a mintear (fijado en initialize)
    uint256 public MAX_SUPPLY;

    /// @notice Certificados ya minteados
    uint256 public totalMinted;

    // =========================================================================
    // Eventos
    // =========================================================================

    event CertificateMinted(
        address indexed to,
        uint256 indexed tokenId,
        string uri
    );

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
     * @param symbol_ Símbolo, ej: "ALMCERT"
     * @param maxSupply_ Número total de certificados a emitir (supply fijo)
     * @param admin_ Dirección que recibe DEFAULT_ADMIN_ROLE y MINTER_ROLE
     */
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint256 maxSupply_,
        address admin_
    ) external initializer {
        require(maxSupply_ > 0, "AlmanacCertificate: maxSupply must be > 0");
        require(admin_ != address(0), "AlmanacCertificate: admin cannot be zero address");

        __ERC721_init(name_, symbol_);
        __ERC721URIStorage_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        MAX_SUPPLY = maxSupply_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, admin_);
    }

    // =========================================================================
    // Mint
    // =========================================================================

    /**
     * @notice Mintea un certificado soulbound a la wallet del usuario
     * @dev Solo MINTER_ROLE. El gas lo paga el relayer/admin wallet.
     * @param to Wallet del usuario (NO la wallet admin)
     * @param uri Metadata URI del certificado (IPFS)
     * @return tokenId ID del certificado minteado
     */
    function mint(
        address to,
        string calldata uri
    )
        external
        onlyRole(MINTER_ROLE)
        nonReentrant
        returns (uint256 tokenId)
    {
        require(totalMinted < MAX_SUPPLY, "AlmanacCertificate: max supply reached");
        require(to != address(0), "AlmanacCertificate: mint to zero address");

        tokenId = totalMinted;
        totalMinted++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit Locked(tokenId);
        emit CertificateMinted(to, tokenId, uri);
    }

    // =========================================================================
    // Transfer override — soulbound + no burn
    // =========================================================================

    /**
     * @dev Bloquea TODA transferencia y TODA quema.
     *      Solo permite mint (from == address(0)).
     *      Certificados son permanentes: no se transfieren ni se queman.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Solo permitir mint (from == address(0))
        if (from != address(0)) {
            revert("AlmanacCertificate: soulbound, cannot transfer or burn");
        }

        return super._update(to, tokenId, auth);
    }

    // =========================================================================
    // ERC-5192 — Soulbound interface
    // =========================================================================

    /**
     * @notice Siempre retorna true — todos los certificados son soulbound permanentes
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        require(_ownerOf(tokenId) != address(0), "AlmanacCertificate: token does not exist");
        return true;
    }

    // =========================================================================
    // Funciones de consulta
    // =========================================================================

    /// @notice Retorna cuántos certificados quedan disponibles
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }

    // =========================================================================
    // supportsInterface
    // =========================================================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorageUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC5192).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // =========================================================================
    // UUPS — Autorización de upgrade
    // =========================================================================

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}
}
