import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { AlmanacCertificate } from "../typechain-types";

describe("AlmanacCertificate", function () {
  let contract: AlmanacCertificate;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let kycVerifier: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let artist: SignerWithAddress;

  const NAME = "Almanac Certificate";
  const SYMBOL = "ALMN";
  const MAX_PAIRS = 100;
  const ROYALTY_BPS = 500; // 5%
  const CERT_URI = "ipfs://QmCertificate123";
  const COLLECT_URI = "ipfs://QmCollectible456";

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const KYC_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KYC_ROLE"));

  beforeEach(async function () {
    [admin, minter, kycVerifier, user1, user2, artist] =
      await ethers.getSigners();

    const Factory = await ethers.getContractFactory("AlmanacCertificate");
    contract = (await upgrades.deployProxy(
      Factory,
      [NAME, SYMBOL, MAX_PAIRS, admin.address],
      { kind: "uups" }
    )) as unknown as AlmanacCertificate;

    await contract.waitForDeployment();

    // Otorgar roles adicionales para pruebas separadas
    await contract.connect(admin).grantRole(MINTER_ROLE, minter.address);
    await contract.connect(admin).grantRole(KYC_ROLE, kycVerifier.address);
  });

  // ===========================================================================
  // Inicialización
  // ===========================================================================

  describe("Inicialización", function () {
    it("debe configurar nombre y símbolo correctamente", async function () {
      expect(await contract.name()).to.equal(NAME);
      expect(await contract.symbol()).to.equal(SYMBOL);
    });

    it("debe configurar MAX_PAIRS correctamente", async function () {
      expect(await contract.MAX_PAIRS()).to.equal(MAX_PAIRS);
    });

    it("debe inicializar pairsMinted en 0", async function () {
      expect(await contract.pairsMinted()).to.equal(0);
    });

    it("debe otorgar los tres roles al admin", async function () {
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await contract.hasRole(MINTER_ROLE, admin.address)).to.be.true;
      expect(await contract.hasRole(KYC_ROLE, admin.address)).to.be.true;
    });

    it("debe revertir si maxPairs es 0", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCertificate");
      await expect(
        upgrades.deployProxy(Factory, [NAME, SYMBOL, 0, admin.address], {
          kind: "uups",
        })
      ).to.be.revertedWith("AlmanacCertificate: maxPairs must be > 0");
    });

    it("debe revertir si admin es address(0)", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCertificate");
      await expect(
        upgrades.deployProxy(
          Factory,
          [NAME, SYMBOL, MAX_PAIRS, ethers.ZeroAddress],
          { kind: "uups" }
        )
      ).to.be.revertedWith("AlmanacCertificate: admin cannot be zero address");
    });
  });

  // ===========================================================================
  // mintDual
  // ===========================================================================

  describe("mintDual", function () {
    it("debe mintear 2 tokens al receptor", async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);

      expect(await contract.ownerOf(0)).to.equal(user1.address); // certificado
      expect(await contract.ownerOf(1)).to.equal(user1.address); // coleccionable
    });

    it("debe asignar IDs correctos: par=certificado, impar=coleccionable", async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);

      expect(await contract.tokenType(0)).to.equal(0); // CERTIFICATE
      expect(await contract.tokenType(1)).to.equal(1); // COLLECTIBLE

      // Segundo mint
      await contract
        .connect(minter)
        .mintDual(user2.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);

      expect(await contract.tokenType(2)).to.equal(0); // CERTIFICATE
      expect(await contract.tokenType(3)).to.equal(1); // COLLECTIBLE
    });

    it("debe asignar URIs correctas a cada token", async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);

      expect(await contract.tokenURI(0)).to.equal(CERT_URI);
      expect(await contract.tokenURI(1)).to.equal(COLLECT_URI);
    });

    it("debe incrementar pairsMinted", async function () {
      expect(await contract.pairsMinted()).to.equal(0);
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
      expect(await contract.pairsMinted()).to.equal(1);
    });

    it("debe emitir eventos Locked y DualMint", async function () {
      await expect(
        contract
          .connect(minter)
          .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS)
      )
        .to.emit(contract, "Locked").withArgs(0)
        .and.to.emit(contract, "Locked").withArgs(1)
        .and.to.emit(contract, "DualMint").withArgs(
          user1.address, 0, 1, artist.address, ROYALTY_BPS
        );
    });

    it("debe revertir si no tiene MINTER_ROLE", async function () {
      await expect(
        contract
          .connect(user1)
          .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("debe revertir si royaltyBps > 1000 (10%)", async function () {
      await expect(
        contract
          .connect(minter)
          .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, 1001)
      ).to.be.revertedWith("AlmanacCertificate: royalty cannot exceed 10%");
    });

    it("debe revertir mint a address(0)", async function () {
      await expect(
        contract
          .connect(minter)
          .mintDual(ethers.ZeroAddress, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS)
      ).to.be.revertedWith("AlmanacCertificate: mint to zero address");
    });
  });

  // ===========================================================================
  // Supply cap
  // ===========================================================================

  describe("Supply fijo (MAX_PAIRS)", function () {
    it("debe revertir cuando se alcanza MAX_PAIRS", async function () {
      const Factory = await ethers.getContractFactory("AlmanacCertificate");
      const smallContract = (await upgrades.deployProxy(
        Factory,
        [NAME, SYMBOL, 2, admin.address],
        { kind: "uups" }
      )) as unknown as AlmanacCertificate;

      await smallContract
        .connect(admin)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
      await smallContract
        .connect(admin)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);

      await expect(
        smallContract
          .connect(admin)
          .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS)
      ).to.be.revertedWith("AlmanacCertificate: max supply reached");
    });

    it("totalSupply debe ser pairsMinted * 2", async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
      expect(await contract.totalSupply()).to.equal(2);

      await contract
        .connect(minter)
        .mintDual(user2.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
      expect(await contract.totalSupply()).to.equal(4);
    });

    it("remainingPairs debe decrementar con cada mint", async function () {
      expect(await contract.remainingPairs()).to.equal(MAX_PAIRS);

      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
      expect(await contract.remainingPairs()).to.equal(MAX_PAIRS - 1);
    });
  });

  // ===========================================================================
  // Soulbound — Certificados
  // ===========================================================================

  describe("Soulbound — Certificados (ID par)", function () {
    beforeEach(async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
    });

    it("certificado NO se puede transferir", async function () {
      await expect(
        contract.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith(
        "AlmanacCertificate: certificates are permanently soulbound"
      );
    });

    it("certificado NO se puede transferir ni con safeTransferFrom", async function () {
      await expect(
        contract
          .connect(user1)
          ["safeTransferFrom(address,address,uint256)"](
            user1.address,
            user2.address,
            0
          )
      ).to.be.revertedWith(
        "AlmanacCertificate: certificates are permanently soulbound"
      );
    });

    it("locked() debe retornar true para certificados siempre", async function () {
      expect(await contract.locked(0)).to.be.true;
    });
  });

  // ===========================================================================
  // Soulbound — Coleccionables antes de KYC
  // ===========================================================================

  describe("Soulbound — Coleccionables antes de KYC (ID impar)", function () {
    beforeEach(async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
    });

    it("coleccionable NO se puede transferir sin KYC", async function () {
      await expect(
        contract.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith(
        "AlmanacCertificate: complete KYC to enable trading"
      );
    });

    it("locked() debe retornar true para coleccionable sin KYC", async function () {
      expect(await contract.locked(1)).to.be.true;
    });

    it("isTradeable() debe retornar false antes de KYC", async function () {
      expect(await contract.isTradeable(1)).to.be.false;
    });
  });

  // ===========================================================================
  // convertToTradeable — KYC
  // ===========================================================================

  describe("convertToTradeable", function () {
    beforeEach(async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
    });

    it("KYC_ROLE puede convertir coleccionable a tradeable", async function () {
      await contract.connect(kycVerifier).convertToTradeable(1);
      expect(await contract.isTradeable(1)).to.be.true;
    });

    it("debe emitir eventos Unlocked y ConvertedToTradeable", async function () {
      await expect(contract.connect(kycVerifier).convertToTradeable(1))
        .to.emit(contract, "Unlocked").withArgs(1)
        .and.to.emit(contract, "ConvertedToTradeable").withArgs(1, kycVerifier.address);
    });

    it("coleccionable tradeable SÍ se puede transferir", async function () {
      await contract.connect(kycVerifier).convertToTradeable(1);

      await expect(
        contract.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.not.be.reverted;

      expect(await contract.ownerOf(1)).to.equal(user2.address);
    });

    it("locked() debe retornar false después de KYC", async function () {
      await contract.connect(kycVerifier).convertToTradeable(1);
      expect(await contract.locked(1)).to.be.false;
    });

    it("debe revertir si no tiene KYC_ROLE", async function () {
      await expect(
        contract.connect(user1).convertToTradeable(1)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("debe revertir al intentar convertir un certificado (ID par)", async function () {
      await expect(
        contract.connect(kycVerifier).convertToTradeable(0)
      ).to.be.revertedWith(
        "AlmanacCertificate: only collectibles can be converted"
      );
    });

    it("debe revertir si ya es tradeable", async function () {
      await contract.connect(kycVerifier).convertToTradeable(1);
      await expect(
        contract.connect(kycVerifier).convertToTradeable(1)
      ).to.be.revertedWith("AlmanacCertificate: already tradeable");
    });

    it("certificado SIGUE siendo soulbound después de convertir su coleccionable", async function () {
      await contract.connect(kycVerifier).convertToTradeable(1);

      await expect(
        contract.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith(
        "AlmanacCertificate: certificates are permanently soulbound"
      );
    });
  });

  // ===========================================================================
  // Royalties — ERC-2981
  // ===========================================================================

  describe("Royalties (ERC-2981)", function () {
    beforeEach(async function () {
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
    });

    it("certificado no tiene royalties (retorna address(0) y 0)", async function () {
      const [receiver, amount] = await contract.royaltyInfo(0, 10000);
      expect(receiver).to.equal(ethers.ZeroAddress);
      expect(amount).to.equal(0);
    });

    it("coleccionable tiene royalties correctas", async function () {
      const salePrice = 10000;
      const [receiver, amount] = await contract.royaltyInfo(1, salePrice);
      expect(receiver).to.equal(artist.address);
      expect(amount).to.equal((salePrice * ROYALTY_BPS) / 10000); // 5% de 10000 = 500
    });
  });

  // ===========================================================================
  // pairedTokenId
  // ===========================================================================

  describe("pairedTokenId", function () {
    it("certificado apunta a su coleccionable", async function () {
      expect(await contract.pairedTokenId(0)).to.equal(1);
      expect(await contract.pairedTokenId(2)).to.equal(3);
    });

    it("coleccionable apunta a su certificado", async function () {
      expect(await contract.pairedTokenId(1)).to.equal(0);
      expect(await contract.pairedTokenId(3)).to.equal(2);
    });
  });

  // ===========================================================================
  // supportsInterface
  // ===========================================================================

  describe("supportsInterface", function () {
    it("debe soportar ERC-5192 (0xb45a3c0e)", async function () {
      expect(await contract.supportsInterface("0xb45a3c0e")).to.be.true;
    });

    it("debe soportar ERC-2981 (0x2a55205a)", async function () {
      expect(await contract.supportsInterface("0x2a55205a")).to.be.true;
    });

    it("debe soportar ERC-721 (0x80ac58cd)", async function () {
      expect(await contract.supportsInterface("0x80ac58cd")).to.be.true;
    });
  });

  // ===========================================================================
  // Upgradeability
  // ===========================================================================

  describe("Upgradeability (UUPS)", function () {
    it("solo DEFAULT_ADMIN_ROLE puede upgradear", async function () {
      const Factory = await ethers.getContractFactory(
        "AlmanacCertificate",
        user1
      );
      await expect(
        upgrades.upgradeProxy(await contract.getAddress(), Factory)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("admin puede upgradear y el estado persiste", async function () {
      // Mintear un token antes del upgrade
      await contract
        .connect(minter)
        .mintDual(user1.address, CERT_URI, COLLECT_URI, artist.address, ROYALTY_BPS);
      expect(await contract.pairsMinted()).to.equal(1);

      // Upgradear (usando la misma implementación como mock)
      const FactoryV2 = await ethers.getContractFactory("AlmanacCertificate");
      const upgraded = (await upgrades.upgradeProxy(
        await contract.getAddress(),
        FactoryV2
      )) as unknown as AlmanacCertificate;

      // Estado debe persistir
      expect(await upgraded.pairsMinted()).to.equal(1);
      expect(await upgraded.ownerOf(0)).to.equal(user1.address);
    });
  });
});
