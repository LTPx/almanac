# Plan: NFT Certificados + Coleccionables en Polygon Amoy

## Contexto

La app Almanac actualmente mintea NFTs ERC-721 simples en Polygon Amoy via ThirdWeb SDK. El cliente requiere: seguridad reforzada, royalties para el artista, tokens soulbound (certificados), coleccionables tradeables, y supply fijo.

Se implementaron **2 contratos custom** (no dual mint en un solo contrato):

- **AlmanacCertificate**: soulbound permanente, no burn, sin royalties
- **AlmanacCollectible**: tradeable desde mint, con royalties ERC-2981

---

## Actores

| Actor                       | Rol                                                   |
| --------------------------- | ----------------------------------------------------- |
| **Admin / Content Manager** | Carga colecciones e imagenes (off-chain)              |
| **Author**                  | Creador de la imagen, tiene wallet para royalties     |
| **Usuario**                 | Nino/adolescente/adulto que aprende y gana ZAPs       |
| **Representante/Guardian**  | Solo menores: autoriza que el NFT tradeable se mintee |
| **Backend App**             | Orquesta ZAPs, random, autorizacion, transacciones    |
| **Relayer/Minter Wallet**   | Wallet con MATIC que paga gas y llama al contrato     |

---

## Flujo completo

```
1. Admin crea coleccion (authorName, authorWallet, royaltyBps, imagenes)
          |
2. Usuario aprueba test → gana ZAPs + curriculum token
          |
3. Usuario crea wallet Polygon (si no tiene) y guarda frase secreta
          |
4. Usuario elige coleccion → Backend mintea CERTIFICADO soulbound
   |      al azar → directo a wallet del usuario (gas pagado por relayer)
   |      El certificado NO se puede transferir NI quemar
   |
   |── Tiempo pasa... ──
   |
5. Usuario solicita NFT tradeable (coleccionable)
          |
          ├── Menor de edad: representante autoriza (off-chain en el app)
          |
          └── Mayor de edad: solicitud directa
          |
6. Backend verifica autorizacion off-chain → mintea COLECCIONABLE
   directo como tradeable → wallet del usuario (gas pagado por relayer)
   El coleccionable verifica on-chain que el usuario posee el certificado
   Relacion 1:1: cada certificado solo puede generar 1 coleccionable
          |
7. Usuario puede vender el coleccionable en OpenSea/marketplace
   Royalties van al authorWallet automaticamente (ERC-2981)
   El certificado SIEMPRE queda en la wallet del usuario
```

---

## Arquitectura de contratos

|                           | AlmanacCertificate         | AlmanacCollectible                                    |
| ------------------------- | -------------------------- | ----------------------------------------------------- |
| **Transferible**          | No (soulbound permanente)  | Si (tradeable desde mint)                             |
| **Quemable**              | No                         | Si (ERC-721 default)                                  |
| **Royalties**             | No                         | Si (ERC-2981, al authorWallet)                        |
| **Supply**                | MAX_SUPPLY fijo            | Mismo MAX_SUPPLY                                      |
| **Cuando se mintea**      | Al completar test          | Cuando usuario solicita + autorizacion                |
| **ERC-5192**              | Si (locked = true siempre) | No                                                    |
| **Verificacion on-chain** | -                          | Verifica ownership del certificado                    |
| **Relacion 1:1**          | -                          | Un coleccionable por certificado (certificateClaimed) |
| **Storage gap**           | Si (\_\_gap[50])           | Si (\_\_gap[50])                                      |

### Contratos desplegados (Polygon Amoy Testnet)

| Contrato           | Proxy                                        | Implementation                               |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| AlmanacCertificate | `0x24d9F34fEfdc33d218814769D3b262E107C24D65` | `0x9F4DFaAa03E4592F24679876A259708A4873dA89` |
| AlmanacCollectible | `0x83fDe568E22f22e04c7EcB3232aB685855a963f1` | `0xF591c9Be88827F76701e6c6051c832161c756DFF` |

- MAX_SUPPLY: 10,000
- MINTER_ROLE: `0xbEB25446b5BaF6ff03A5b46a05F4257A936AF391`
- Verificados en Polygonscan/Sourcify

---

## Fase 1: Smart Contracts — COMPLETADA

### Lo que se hizo

- Directorio `/contracts/` con Hardhat, OpenZeppelin v5, UUPS proxy
- `AlmanacCertificate.sol`: soulbound, no burn, no royalties, ERC-5192, AccessControl
- `AlmanacCollectible.sol`: tradeable, ERC-2981 royalties, verificacion on-chain de ownership del certificado, relacion 1:1 (certificateClaimed), validacion de rango
- 56 tests pasando (23 certificate + 33 collectible)
- Deploy a Polygon Amoy via proxy UUPS
- ABIs copiados a `/lib/contracts/`
- Contratos verificados en Polygonscan/Sourcify

### Archivos creados

| Archivo                                       | Descripcion                                  |
| --------------------------------------------- | -------------------------------------------- |
| `/contracts/package.json`                     | Config Hardhat                               |
| `/contracts/hardhat.config.ts`                | Config Hardhat + Polygon Amoy + Etherscan V2 |
| `/contracts/contracts/AlmanacCertificate.sol` | Contrato certificado soulbound               |
| `/contracts/contracts/AlmanacCollectible.sol` | Contrato coleccionable tradeable             |
| `/contracts/test/AlmanacCertificate.test.ts`  | 23 tests                                     |
| `/contracts/test/AlmanacCollectible.test.ts`  | 33 tests                                     |
| `/contracts/scripts/deploy.ts`                | Deploy ambos contratos via UUPS              |
| `/contracts/scripts/grant-roles.ts`           | Otorga MINTER_ROLE al admin wallet           |
| `/contracts/scripts/copy-abi.js`              | Copia ABIs a /lib/contracts/                 |
| `/lib/contracts/AlmanacCertificate.json`      | ABI compilado                                |
| `/lib/contracts/AlmanacCollectible.json`      | ABI compilado                                |

---

## Fase 2: Schema de Base de Datos — COMPLETADA

### 2.1 Actualizar Prisma schema

**Modificar:** `/prisma/schema.prisma`

Nuevos enums:

```prisma
enum NFTTokenType {
  CERTIFICATE
  COLLECTIBLE
  @@map("nft_token_type")
}
```

Nuevos campos en `EducationalNFT`:

```prisma
tokenType           NFTTokenType    @default(CERTIFICATE)
linkedCertTokenId   String?         // tokenId del certificado en el contrato (para coleccionables)
isTradeable         Boolean         @default(false)
artistAddress       String?
royaltyBps          Int?            // basis points: 500 = 5%
```

Nuevos campos en `NFTCollection`:

```prisma
defaultArtistAddress  String?
defaultRoyaltyBps     Int?    @default(500)  // 5% default
maxSupply             Int?                   // coincide con MAX_SUPPLY del contrato
certificateContractAddress  String?          // address del contrato de certificados
collectibleContractAddress  String?          // address del contrato de coleccionables
```

### 2.2 Ejecutar migracion

```bash
npx prisma migrate dev --name add_nft_contract_fields
```

Los registros NFT existentes quedan con defaults seguros (`CERTIFICATE`, `isTradeable: false`).

---

## Fase 3: Backend — COMPLETADA

### Lo que se hizo

- **`/lib/contracts/almanac-contract.ts`** (nuevo): capa de interaccion con contratos custom via ethers.js v5. Exporta `mintCertificate()` y `mintCollectible()` que llaman directamente a los contratos desplegados.
- **`/lib/nft-service.ts`** (modificado): nuevas funciones `mintCertificateNFT()` y `mintCollectibleNFT()` que orquestan coleccion + metadata + llamada al contrato. Se mantiene `mintEducationalNFT()` para backward compatibility.
- **`/app/api/users/[userId]/nfts/mint/route.ts`** (modificado): usa `mintCertificateNFT()` en vez de `mintEducationalNFT()`. Guarda con `tokenType: CERTIFICATE`, `isTradeable: false`.
- **`/app/api/users/[userId]/nfts/mint-collectible/route.ts`** (nuevo): endpoint POST que verifica ownership del certificado, relacion 1:1, obtiene datos del artista, mintea coleccionable y guarda con `tokenType: COLLECTIBLE`, `isTradeable: true`.
- **`/app/api/admin/nfts/test-mint/route.ts`** (modificado): acepta `tokenType` ("CERTIFICATE" | "COLLECTIBLE") y `certificateNftId` para mintear ambos tipos en modo test.
- **`/app/api/users/[userId]/nfts/route.ts`** (modificado): incluye `tokenType`, `isTradeable`, `linkedCertTokenId`, `tokenId` en la respuesta del listado.

### Archivos creados/modificados

| Archivo                                                  | Accion     |
| -------------------------------------------------------- | ---------- |
| `/lib/contracts/almanac-contract.ts`                     | Creado     |
| `/lib/nft-service.ts`                                    | Modificado |
| `/app/api/users/[userId]/nfts/mint/route.ts`             | Modificado |
| `/app/api/users/[userId]/nfts/mint-collectible/route.ts` | Creado     |
| `/app/api/admin/nfts/test-mint/route.ts`                 | Modificado |
| `/app/api/users/[userId]/nfts/route.ts`                  | Modificado |

---

## Fase 4: Frontend / Admin — COMPLETADA

### Lo que se hizo

- **`/lib/types.ts`** (modificado): nuevo tipo `NFTTokenType`, campos `tokenType`, `isTradeable`, `linkedCertTokenId` en `EducationalNFT` y `EducationalNFTAsset`.
- **`/components/admin/nft-collection-form.tsx`** (modificado): nuevos campos `certificateContractAddress`, `collectibleContractAddress`, `defaultArtistAddress`, `defaultRoyaltyBps`, `maxSupply` con validacion de addresses.
- **`/app/api/nft-collections/route.ts`** (modificado): POST acepta y guarda los nuevos campos de coleccion.
- **`/app/api/nft-collections/[collectionId]/route.ts`** (modificado): PUT acepta y guarda los nuevos campos.
- **`/components/car-nft.tsx`** (modificado): badge de tipo "Certificado" (verde) / "Coleccionable" (naranja) en esquina superior izquierda.
- **`/app/(root)/achievements/nft/tabs/nfts-tab.tsx`** (modificado): pasa `rarity` y `tokenType` al componente CardNFT.

### Archivos modificados
| Archivo | Accion |
|---------|--------|
| `/lib/types.ts` | Modificado |
| `/components/admin/nft-collection-form.tsx` | Modificado |
| `/app/api/nft-collections/route.ts` | Modificado |
| `/app/api/nft-collections/[collectionId]/route.ts` | Modificado |
| `/components/car-nft.tsx` | Modificado |
| `/app/(root)/achievements/nft/tabs/nfts-tab.tsx` | Modificado |

---

## Fase 5: Generador de Arte NFT por Capas (estilo HashLips) — PENDIENTE

El cliente tiene assets por capas (Background, Body, Eyes, Mouth, etc.) y necesita que al momento del mint, el backend combine capas aleatorias en una sola imagen PNG. Cada trait individual tiene su propio peso de rareza. Las imagenes se suben via admin y se almacenan en DigitalOcean Spaces. La generacion es **on-demand al mint**.

### 5.1 Schema + Migracion

Nuevos modelos en `prisma/schema.prisma`:

- **`LayerCategory`** — Categoria de capa (Background, Body, Eyes...) con orden de composicion y flag `isRequired`. Unico por coleccion+nombre.
- **`LayerTrait`** — Trait individual (Gold Background, Blue Eyes...) con `imageUrl` (DO Spaces), `weight` (peso de rareza, mayor=mas comun). Unico por categoria+nombre.
- **`GeneratedNFT`** — Imagen compuesta generada. Tiene `combinationHash` (SHA-256 de trait IDs) para garantizar unicidad. Linked a `NFTAsset` para compatibilidad con mint flow existente.
- **`GeneratedNFTTrait`** — Join table entre GeneratedNFT y LayerTrait.

Agregar relaciones inversas en `NFTCollection` y `NFTAsset`.

### 5.2 Instalar sharp

```bash
npm install sharp && npm install -D @types/sharp
```

### 5.3 S3 — uploadBuffer

**Modificar:** `lib/s3.ts`

Nueva funcion `uploadBuffer(buffer, folder, extension)` para subir la imagen compuesta a DO Spaces.

### 5.4 Motor de generacion — `lib/art-generator.ts`

**Nuevo archivo.** Funciones:

1. `selectTraitsByWeight(categories)` — Seleccion aleatoria ponderada por peso
2. `compositeImage(traits)` — `sharp` para componer PNGs en orden
3. `deriveRarity(traits, categories)` — Probabilidad combinada → NORMAL/RARE/EPIC/UNIQUE
4. `generateCombinationHash(traitIds)` — SHA-256 para unicidad
5. `generateNFTArt(collectionId)` — Orquesta todo: seleccionar → verificar unicidad → componer → subir a DO Spaces → crear registros DB → retornar resultado

### 5.5 API Routes admin

| Ruta | Metodos | Descripcion |
|------|---------|-------------|
| `/api/admin/layer-categories` | GET, POST | CRUD categorias de capas |
| `/api/admin/layer-categories/[categoryId]` | PUT, DELETE | Actualizar/eliminar categoria |
| `/api/admin/layer-traits` | GET, POST | CRUD traits (POST con upload PNG a DO Spaces) |
| `/api/admin/layer-traits/[traitId]` | PUT, DELETE | Actualizar peso/nombre, eliminar trait+imagen |
| `/api/admin/generate-nft` | POST | Preview de generacion (admin, no mintea) |

### 5.6 Admin UI

| Archivo | Descripcion |
|---------|-------------|
| `app/(admin)/admin/nfts/layers/page.tsx` | Pagina de gestion de capas por coleccion |
| `components/admin/layer-category-manager.tsx` | Cards de categorias con traits, pesos editables, probabilidades |
| `components/admin/layer-trait-uploader.tsx` | Upload PNG + nombre + peso |
| `components/admin/nft-preview-generator.tsx` | Boton "Generar Preview" con resultado visual |

### 5.7 Integracion con mint flow

**Modificar:** `mint/route.ts`, `mint-collectible/route.ts`, `test-mint/route.ts`

Logica condicional: si la coleccion tiene `LayerCategory` configuradas → usar `generateNFTArt()`. Si no → fallback al pool estatico existente (`getAvailableNFTImage()`).

### 5.8 Tipos TypeScript

**Modificar:** `lib/types.ts` — Agregar tipos para LayerCategory, LayerTrait, GeneratedNFT.

---

## Fase 6: Testing de integracion — PENDIENTE

### 6.1 Testing de integracion

- [ ] Flujo certificado: completar curriculum → mint → verificar token en blockchain + registro en DB
- [ ] Certificado NO se puede transferir (revert en blockchain)
- [ ] Certificado NO se puede quemar (revert en blockchain)
- [ ] Flujo coleccionable: solicitar → autorizacion → mint → verificar en blockchain + DB
- [ ] Coleccionable verifica ownership del certificado on-chain
- [ ] Coleccionable es 1:1 (no se puede reclamar dos veces el mismo certificado)
- [ ] `royaltyInfo()` retorna valores correctos para coleccionables
- [ ] Admin test-mint funciona para ambos tipos
- [ ] Transferencia de coleccionable funciona (usuario puede vender)
- [ ] Generacion por capas: subir layers → configurar pesos → generar preview → mint con imagen generada
- [ ] Unicidad: no se generan combinaciones duplicadas
- [ ] Colecciones sin capas siguen usando pool estatico

---

## Orden de ejecucion

| #   | Tarea                                | Estado     | Archivos                                           |
| --- | ------------------------------------ | ---------- | -------------------------------------------------- |
| 1   | Inicializar Hardhat                  | COMPLETADO | `/contracts/`                                      |
| 2   | Escribir contratos Solidity          | COMPLETADO | `AlmanacCertificate.sol`, `AlmanacCollectible.sol` |
| 3   | Escribir tests                       | COMPLETADO | 56 tests pasando                                   |
| 4   | Scripts de deploy                    | COMPLETADO | `deploy.ts`, `grant-roles.ts`                      |
| 5   | Deploy a Polygon Amoy                | COMPLETADO | Ambos contratos desplegados y verificados          |
| 6   | Copiar ABIs                          | COMPLETADO | `/lib/contracts/*.json`                            |
| 7   | Migracion Prisma                     | COMPLETADO | `schema.prisma`                                    |
| 8   | Crear `almanac-contract.ts`          | COMPLETADO | `/lib/contracts/almanac-contract.ts`               |
| 9   | Actualizar `nft-service.ts`          | COMPLETADO | `/lib/nft-service.ts`                              |
| 10  | Actualizar API de mint (certificado) | COMPLETADO | `mint/route.ts`                                    |
| 11  | Crear API de mint (coleccionable)    | COMPLETADO | `mint-collectible/route.ts`                        |
| 12  | Actualizar admin test-mint           | COMPLETADO | `test-mint/route.ts`                               |
| 13  | Actualizar tipos TS                  | COMPLETADO | `lib/types.ts`                                     |
| 14  | Actualizar frontend (CardNFT, tabs)  | COMPLETADO | `car-nft.tsx`, `nfts-tab.tsx`                      |
| 15  | Actualizar admin (form + API)        | COMPLETADO | `nft-collection-form.tsx`, API routes              |
| 16  | Schema generador de capas            | PENDIENTE  | `schema.prisma`                                    |
| 17  | Instalar sharp + uploadBuffer        | PENDIENTE  | `package.json`, `lib/s3.ts`                        |
| 18  | Motor de generacion                  | PENDIENTE  | `lib/art-generator.ts`                             |
| 19  | API admin capas                      | PENDIENTE  | `app/api/admin/layer-*`                            |
| 20  | Admin UI capas                       | PENDIENTE  | `app/(admin)/admin/nfts/layers/`                   |
| 21  | Integracion mint + capas             | PENDIENTE  | `mint/route.ts`, `mint-collectible/route.ts`       |
| 22  | Testing de integracion               | PENDIENTE  | —                                                  |

---

## Decision sobre royalties: Opcion B (treasury unico)

ERC-2981 acepta UN solo receptor de royalties. Se eligio:

**Opcion B — Treasury unico + split off-chain** (mas simple)

- El `authorWallet` en el contrato recibe todos los royalties
- Si se necesita split Almanac + Artista, se maneja off-chain
- Se puede migrar a PaymentSplitter on-chain en iteracion futura

---

## Variables de entorno requeridas

### App (.env del root)

```env
# Contratos nuevos (agregar)
CERTIFICATE_CONTRACT_ADDRESS=0x24d9F34fEfdc33d218814769D3b262E107C24D65
COLLECTIBLE_CONTRACT_ADDRESS=0x83fDe568E22f22e04c7EcB3232aB685855a963f1

# Ya existentes
ADMIN_WALLET_PRIVATE_KEY=...
THIRDWEB_SECRET_KEY=...
```

### Contracts (.env en /contracts/)

```env
DEPLOYER_PRIVATE_KEY=...
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=...
ADMIN_WALLET_ADDRESS=...
```

---

## Checklist de cumplimiento

- [x] El NFT se mintea a la wallet del usuario, no al admin
- [x] Quien paga gas es el relayer/minter wallet de la app
- [x] Colecciones off-chain incluyen authorWallet y royaltyBps
- [ ] Random: metodo reproducible/auditable (logs y artworkId) — pendiente backend
- [x] Certificado: soulbound permanente (transfer revierte)
- [x] Certificado: no se puede quemar (burn revierte)
- [x] Coleccionable: tradeable desde mint (autorizacion off-chain previa)
- [x] Coleccionable: verifica ownership del certificado on-chain
- [x] Coleccionable: relacion 1:1 con certificado (certificateClaimed)
- [ ] Menores: mecanismo de autorizacion del representante — pendiente backend
- [x] Royalties: solo en coleccionables, apuntan a authorWallet (ERC-2981)
- [x] Roles: MINTER_ROLE solo en backend wallet
- [x] Roles: DEFAULT_ADMIN_ROLE en deployer (migrar a multisig en mainnet)
- [x] Supply fijo: MAX_SUPPLY inmutable
- [x] UUPS proxy upgradeable
- [x] Storage gap (\_\_gap[50]) en ambos contratos
