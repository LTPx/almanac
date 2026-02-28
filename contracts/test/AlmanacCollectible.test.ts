import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { AlmanacCollectible, AlmanacCertificate } from "../typechain-types";

describe("AlmanacCollectible", function () {
  let collectible: AlmanacCollectible;
  let certificate: AlmanacCertificate;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let author: SignerWithAddress;

  const CERT_NAME = "Almanac Certificate";
  const CERT_SYMBOL = "ALMCERT";
  const COL_NAME = "Almanac Collectible";
  const COL_SYMBOL = "ALMCOL";
  const MAX_SUPPLY = 100;
  const ROYALTY_BPS = 500; // 5%
  const CERT_URI = "ipfs://QmCertificate123";
  const COL_URI = "ipfs://QmCollectible456";

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [admin, minter, user1, user2, author] = await ethers.getSigners();

    // Deploy certificado primero (para obtener su address)
    const CertFactory = await ethers.getContractFactory("AlmanacCertificate");
    certificate = (await upgrades.deployProxy(
      CertFactory,
      [CERT_NAME, CERT_SYMBOL, MAX_SUPPLY, admin.address],
      { kind: "uups" }
    )) as unknown as AlmanacCertificate;
    await certificate.waitForDeployment();

    // Deploy coleccionable, referenciando el contrato de certificados
    const ColFactory = await ethers.getContractFactory("AlmanacCollectible");
    collectible = (await upgrades.deployProxy(
      ColFactory,
      [COL_NAME, COL_SYMBOL, MAX_SUPPLY, admin.address, await certificate.getAddress()],
      { kind: "uups" }
    )) as unknown as AlmanacCollectible;
    await collectible.waitForDeployment();

    // Otorgar MINTER_ROLE
    await certificate.connect(admin).grantRole(MINTER_ROLE, minter.address);
    await collectible.connect(admin).grantRole(MINTER_ROLE, minter.address);
  });

  // ===========================================================================
  // Inicializacion
  // ===========================================================================

  describe("Inicializacion", function () {
    it("debe configurar nombre y simbolo", async function () {
      expect(await collectible.name()).to.equal(COL_NAME);
      expect(await collectible.symbol()).to.equal(COL_SYMBOL);
    });

    it("debe configurar MAX_SUPPLY", async function () {
      expect(await collectible.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("debe guardar la referencia al contrato de certificados", async function () {
      expect(await collectible.certificateContract()).to.equal(
        await certificate.getAddress()
      );
    });

    it("debe inicializar totalMinted en 0", async function () {
      expect(await collectible.totalMinted()).to.equal(0);
    });

    it("debe revertir si maxSupply es 0", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCollectible");
      await expect(
        upgrades.deployProxy(
          Factory,
          [COL_NAME, COL_SYMBOL, 0, admin.address, await certificate.getAddress()],
          { kind: "uups" }
        )
      ).to.be.revertedWith("AlmanacCollectible: maxSupply must be > 0");
    });

    it("debe revertir si certificateContract es address(0)", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCollectible");
      await expect(
        upgrades.deployProxy(
          Factory,
          [COL_NAME, COL_SYMBOL, MAX_SUPPLY, admin.address, ethers.ZeroAddress],
          { kind: "uups" }
        )
      ).to.be.revertedWith("AlmanacCollectible: certificate contract cannot be zero");
    });
  });

  // ===========================================================================
  // Mint
  // ===========================================================================

  describe("mint", function () {
    beforeEach(async function () {
      // Primero mintear un certificado para el usuario
      await certificate.connect(minter).mint(user1.address, CERT_URI);
    });

    it("debe mintear un coleccionable al usuario", async function () {
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );
      expect(await collectible.ownerOf(0)).to.equal(user1.address);
    });

    it("debe asignar el URI correcto", async function () {
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );
      expect(await collectible.tokenURI(0)).to.equal(COL_URI);
    });

    it("debe vincular al certificado correcto", async function () {
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );
      expect(await collectible.certificateTokenId(0)).to.equal(0);
    });

    it("debe incrementar totalMinted", async function () {
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );
      expect(await collectible.totalMinted()).to.equal(1);
    });

    it("debe emitir evento CollectibleMinted", async function () {
      await expect(
        collectible.connect(minter).mint(
          user1.address, COL_URI, 0, author.address, ROYALTY_BPS
        )
      ).to.emit(collectible, "CollectibleMinted").withArgs(
        user1.address, 0, 0, author.address, ROYALTY_BPS
      );
    });

    it("debe revertir si no tiene MINTER_ROLE", async function () {
      await expect(
        collectible.connect(user1).mint(
          user1.address, COL_URI, 0, author.address, ROYALTY_BPS
        )
      ).to.be.revertedWithCustomError(collectible, "AccessControlUnauthorizedAccount");
    });

    it("debe revertir si authorWallet es address(0)", async function () {
      await expect(
        collectible.connect(minter).mint(
          user1.address, COL_URI, 0, ethers.ZeroAddress, ROYALTY_BPS
        )
      ).to.be.revertedWith("AlmanacCollectible: author cannot be zero address");
    });

    it("debe revertir si royaltyBps > 1000 (10%)", async function () {
      await expect(
        collectible.connect(minter).mint(
          user1.address, COL_URI, 0, author.address, 1001
        )
      ).to.be.revertedWith("AlmanacCollectible: royalty cannot exceed 10%");
    });
  });

  // ===========================================================================
  // Tradeable — transferencia libre
  // ===========================================================================

  describe("Transferencia libre (tradeable)", function () {
    beforeEach(async function () {
      await certificate.connect(minter).mint(user1.address, CERT_URI);
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );
    });

    it("el coleccionable SE PUEDE transferir", async function () {
      await collectible.connect(user1).transferFrom(user1.address, user2.address, 0);
      expect(await collectible.ownerOf(0)).to.equal(user2.address);
    });

    it("el coleccionable SE PUEDE transferir con safeTransferFrom", async function () {
      await collectible.connect(user1)["safeTransferFrom(address,address,uint256)"](
        user1.address, user2.address, 0
      );
      expect(await collectible.ownerOf(0)).to.equal(user2.address);
    });

    it("el certificado sigue soulbound despues de transferir el coleccionable", async function () {
      await collectible.connect(user1).transferFrom(user1.address, user2.address, 0);

      // El certificado sigue en user1 y sigue soulbound
      expect(await certificate.ownerOf(0)).to.equal(user1.address);
      await expect(
        certificate.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith("AlmanacCertificate: soulbound, cannot transfer or burn");
    });
  });

  // ===========================================================================
  // Supply fijo
  // ===========================================================================

  describe("Supply fijo (MAX_SUPPLY)", function () {
    it("debe revertir cuando se alcanza MAX_SUPPLY", async function () {
      const CertFactory = await ethers.getContractFactory("AlmanacCertificate");
      const smallCert = (await upgrades.deployProxy(
        CertFactory, [CERT_NAME, CERT_SYMBOL, 2, admin.address], { kind: "uups" }
      )) as unknown as AlmanacCertificate;

      const ColFactory = await ethers.getContractFactory("AlmanacCollectible");
      const smallCol = (await upgrades.deployProxy(
        ColFactory,
        [COL_NAME, COL_SYMBOL, 2, admin.address, await smallCert.getAddress()],
        { kind: "uups" }
      )) as unknown as AlmanacCollectible;

      await smallCol.connect(admin).mint(user1.address, COL_URI, 0, author.address, ROYALTY_BPS);
      await smallCol.connect(admin).mint(user1.address, COL_URI, 1, author.address, ROYALTY_BPS);

      await expect(
        smallCol.connect(admin).mint(user1.address, COL_URI, 2, author.address, ROYALTY_BPS)
      ).to.be.revertedWith("AlmanacCollectible: max supply reached");
    });

    it("remainingSupply debe decrementar", async function () {
      expect(await collectible.remainingSupply()).to.equal(MAX_SUPPLY);
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );
      expect(await collectible.remainingSupply()).to.equal(MAX_SUPPLY - 1);
    });
  });

  // ===========================================================================
  // Royalties — ERC-2981
  // ===========================================================================

  describe("Royalties (ERC-2981)", function () {
    beforeEach(async function () {
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );
    });

    it("debe retornar royalties correctas", async function () {
      const salePrice = 10000;
      const [receiver, amount] = await collectible.royaltyInfo(0, salePrice);
      expect(receiver).to.equal(author.address);
      expect(amount).to.equal((salePrice * ROYALTY_BPS) / 10000); // 5% = 500
    });

    it("royalties van al author, no al admin", async function () {
      const [receiver] = await collectible.royaltyInfo(0, 10000);
      expect(receiver).to.equal(author.address);
      expect(receiver).to.not.equal(admin.address);
    });
  });

  // ===========================================================================
  // supportsInterface
  // ===========================================================================

  describe("supportsInterface", function () {
    it("debe soportar ERC-2981 (0x2a55205a)", async function () {
      expect(await collectible.supportsInterface("0x2a55205a")).to.be.true;
    });

    it("debe soportar ERC-721 (0x80ac58cd)", async function () {
      expect(await collectible.supportsInterface("0x80ac58cd")).to.be.true;
    });
  });

  // ===========================================================================
  // Upgradeability
  // ===========================================================================

  describe("Upgradeability (UUPS)", function () {
    it("solo DEFAULT_ADMIN_ROLE puede upgradear", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCollectible", user1);
      await expect(
        upgrades.upgradeProxy(await collectible.getAddress(), Factory)
      ).to.be.revertedWithCustomError(collectible, "AccessControlUnauthorizedAccount");
    });

    it("admin puede upgradear y el estado persiste", async function () {
      await collectible.connect(minter).mint(
        user1.address, COL_URI, 0, author.address, ROYALTY_BPS
      );

      const FactoryV2 = await ethers.getContractFactory("AlmanacCollectible");
      const upgraded = (await upgrades.upgradeProxy(
        await collectible.getAddress(), FactoryV2
      )) as unknown as AlmanacCollectible;

      expect(await upgraded.totalMinted()).to.equal(1);
      expect(await upgraded.ownerOf(0)).to.equal(user1.address);
    });
  });
});
