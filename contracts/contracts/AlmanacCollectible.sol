// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title IAlmanacCertificate
 * @dev Interfaz minima para verificar ownership de certificados on-chain.
 */
interface IAlmanacCertificate {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title AlmanacCollectible
 * @dev Contrato de NFTs coleccionables con royalties.
 *
 * Cada coleccionable:
 *   - Se mintea directo como tradeable (la autorizacion se verifica off-chain en el backend)
 *   - Tiene royalties ERC-2981 que apuntan al authorWallet
 *   - Comparte MAX_SUPPLY con AlmanacCertificate (1 coleccionable por cada certificado)
 *   - Es libremente transferible desde el momento del mint
 *   - Verifica on-chain que el usuario posee el certificado asociado
 *   - Garantiza relacion 1:1 (un coleccionable por certificado)
 *
 * Flujo:
 *   1. Usuario tiene un certificado soulbound y solicita el coleccionable
 *   2. Backend verifica autorizacion (menor: guardian aprueba / mayor: directo)
 *   3. Backend llama mint() — el contrato verifica ownership del certificado on-chain
 *   4. NFT va directo a la wallet del usuario, ya tradeable
 *   5. En ventas secundarias, royalties van al authorWallet
 *
 * Estandares: ERC-721, ERC-2981 (Royalties), AccessControl, UUPS.
 */
contract AlmanacCollectible is
    ERC721URIStorageUpgradeable,
    ERC2981Upgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    // =========================================================================
    // Roles
    // =========================================================================

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // =========================================================================
    // Estado
    // =========================================================================

    /// @notice Numero maximo de coleccionables (igual al MAX_SUPPLY de certificados)
    uint256 public MAX_SUPPLY;

    /// @notice Coleccionables ya minteados
    uint256 public totalMinted;

    /// @notice Mapeo de tokenId del coleccionable al tokenId del certificado asociado
    mapping(uint256 => uint256) public certificateTokenId;

    /// @notice Direccion del contrato de certificados (para verificacion on-chain)
    address public certificateContract;

    /// @notice Indica si un certificado ya fue usado para mintear un coleccionable (1:1)
    mapping(uint256 => bool) public certificateClaimed;

    // =========================================================================
    // Eventos
    // =========================================================================

    event CollectibleMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed linkedCertificateId,
        address authorWallet,
        uint96 royaltyBps
    );

    // =========================================================================
    // Inicializacion (proxy pattern)
    // =========================================================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Inicializa el contrato (llamado una vez via proxy)
     * @param name_ Nombre, ej: "Almanac Collectibles"
     * @param symbol_ Simbolo, ej: "ALMCOL"
     * @param maxSupply_ Supply maximo (debe coincidir con AlmanacCertificate.MAX_SUPPLY)
     * @param admin_ Direccion que recibe DEFAULT_ADMIN_ROLE y MINTER_ROLE
     * @param certificateContract_ Direccion del contrato AlmanacCertificate
     */
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint256 maxSupply_,
        address admin_,
        address certificateContract_
    ) external initializer {
        require(maxSupply_ > 0, "AlmanacCollectible: maxSupply must be > 0");
        require(admin_ != address(0), "AlmanacCollectible: admin cannot be zero address");
        require(certificateContract_ != address(0), "AlmanacCollectible: certificate contract cannot be zero");

        __ERC721_init(name_, symbol_);
        __ERC721URIStorage_init();
        __ERC2981_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        MAX_SUPPLY = maxSupply_;
        certificateContract = certificateContract_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, admin_);
    }

    // =========================================================================
    // Mint
    // =========================================================================

    /**
     * @notice Mintea un coleccionable tradeable a la wallet del usuario
     * @dev Solo MINTER_ROLE. La autorizacion (KYC/guardian) se verifica off-chain.
     *      El gas lo paga el relayer/admin wallet.
     *      Verifica on-chain que:
     *        - El usuario posee el certificado asociado
     *        - El certificado no ha sido usado para otro coleccionable (1:1)
     *        - El linkedCertId esta en rango valido
     * @param to Wallet del usuario
     * @param uri Metadata URI del coleccionable (IPFS)
     * @param linkedCertId Token ID del certificado asociado en AlmanacCertificate
     * @param authorWallet Wallet del autor/artista (recibe royalties)
     * @param royaltyBps Porcentaje de royalties en basis points (500 = 5%, max 1000 = 10%)
     * @return tokenId ID del coleccionable minteado
     */
    function mint(
        address to,
        string calldata uri,
        uint256 linkedCertId,
        address authorWallet,
        uint96 royaltyBps
    )
        external
        onlyRole(MINTER_ROLE)
        nonReentrant
        returns (uint256 tokenId)
    {
        require(totalMinted < MAX_SUPPLY, "AlmanacCollectible: max supply reached");
        require(to != address(0), "AlmanacCollectible: mint to zero address");
        require(authorWallet != address(0), "AlmanacCollectible: author cannot be zero address");
        require(royaltyBps <= 1000, "AlmanacCollectible: royalty cannot exceed 10%");

        // (C) Validar que linkedCertId esta en rango
        require(linkedCertId < MAX_SUPPLY, "AlmanacCollectible: invalid certificate id");

        // (B) Asegurar 1:1 — un coleccionable por certificado
        require(!certificateClaimed[linkedCertId], "AlmanacCollectible: certificate already claimed");

        // (A) Verificar que el usuario posee el certificado on-chain
        require(
            IAlmanacCertificate(certificateContract).ownerOf(linkedCertId) == to,
            "AlmanacCollectible: user does not own certificate"
        );

        tokenId = totalMinted;
        totalMinted++;

        certificateClaimed[linkedCertId] = true;
        certificateTokenId[tokenId] = linkedCertId;

        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _setTokenRoyalty(tokenId, authorWallet, royaltyBps);

        emit CollectibleMinted(to, tokenId, linkedCertId, authorWallet, royaltyBps);
    }

    // =========================================================================
    // Funciones de consulta
    // =========================================================================

    /// @notice Retorna cuantos coleccionables quedan disponibles
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }

    // =========================================================================
    // supportsInterface
    // =========================================================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorageUpgradeable, ERC2981Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // =========================================================================
    // UUPS
    // =========================================================================

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    // =========================================================================
    // (E) Storage gap para upgrades futuros
    // =========================================================================

    /**
     * @dev Reserva 50 slots de storage para variables futuras sin colisionar
     *      con contratos heredados en upgrades.
     */
    uint256[50] private __gap;
}
