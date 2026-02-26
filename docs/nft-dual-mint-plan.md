# Plan: NFT Dual Mint con Soulbound, Royalties y Supply Fijo

## Contexto
La app Almanac actualmente mintea NFTs ERC-721 simples en Polygon Amoy via ThirdWeb SDK. El cliente requiere: seguridad reforzada, royalties (Almanac + artista), tokens soulbound convertibles a tradeable con KYC, supply fijo, y **dual mint** (un certificado permanente + un coleccionable tradeable por cada mint).

No hay contratos Solidity en el repo — se usa un ERC-721 pre-desplegado de ThirdWeb. Se necesita un contrato custom.

---

## Resumen del modelo dual mint

Cada vez que un usuario mintea un NFT, se crean **2 tokens**:

| Token | Tipo | Soulbound | Royalties | Para qué sirve |
|-------|------|-----------|-----------|----------------|
| ID par (0, 2, 4...) | CERTIFICATE | Permanente (nunca se transfiere) | No | Prueba de que completó el curso |
| ID impar (1, 3, 5...) | COLLECTIBLE | Inicial, convertible con KYC | Sí (Almanac + Artista) | El coleccionable que puede vender |

Lenin completa un curso → recibe token #0 (certificado, soulbound para siempre) + token #1 (coleccionable, soulbound hasta pasar KYC)
Si Lenin pasa KYC → token #1 se convierte a tradeable → puede venderlo en OpenSea
Lenin SIEMPRE conserva el token #0 como prueba del curso.

---

## Fase 1: Smart Contract (Hardhat + Solidity)

### 1.1 Inicializar Hardhat
- Crear directorio `/contracts/` con su propio `package.json`, `hardhat.config.ts`
- Dependencias: `hardhat`, `@openzeppelin/contracts-upgradeable` (v5), `@openzeppelin/hardhat-upgrades`, `@nomicfoundation/hardhat-toolbox`
- Configurar red Polygon Amoy (chainId 80002)
- Agregar scripts al root `package.json`: `contract:compile`, `contract:test`, `contract:deploy`

### 1.2 Escribir `AlmanacCertificate.sol`
**Nuevo archivo:** `/contracts/contracts/AlmanacCertificate.sol`

Hereda de:
- `ERC721URIStorageUpgradeable` — NFT estándar con metadata URI
- `ERC2981Upgradeable` — royalties estándar (soportado por OpenSea, etc.)
- `AccessControlUpgradeable` — roles: ADMIN_ROLE, MINTER_ROLE, KYC_ROLE
- `UUPSUpgradeable` — proxy upgradeable (para poder parchear bugs sin redesplegar)
- `IERC5192` — interfaz soulbound (implementación manual, OZ no la incluye)

**Esquema de token IDs:**
- IDs pares = CERTIFICATE (soulbound permanente)
- IDs impares = COLLECTIBLE (soulbound → tradeable con KYC)

**Funciones principales:**
| Función | Rol requerido | Descripción |
|---------|--------------|-------------|
| `initialize(name, symbol, maxPairs, admin)` | — | Setup inicial via proxy |
| `mintDual(to, certURI, collectURI, artistAddr, royaltyBps)` | MINTER_ROLE | Mintea par de tokens |
| `convertToTradeable(tokenId)` | KYC_ROLE | Solo collectibles, llama después de KYC |
| `_update()` override | interno | Bloquea transfers según tipo y estado |
| `royaltyInfo()` override | — | Retorna royalties solo para collectibles |
| `locked(tokenId)` | — | ERC-5192: retorna si el token está bloqueado |

**Supply:** `MAX_PAIRS` se fija en `initialize()` y es immutable. `pairsMinted` lo rastrea.

**Funciones de consulta:**
- `tokenType(tokenId)` → CERTIFICATE o COLLECTIBLE
- `pairedTokenId(tokenId)` → el token hermano
- `isTradeable(tokenId)` → bool
- `totalSupply()` → `pairsMinted * 2`

### 1.3 Tests del contrato
**Nuevo archivo:** `/contracts/test/AlmanacCertificate.test.ts`

Casos a cubrir:
- [ ] Inicialización: MAX_PAIRS correcto, roles asignados, nombre/símbolo
- [ ] `mintDual()`: crea 2 tokens, IDs correctos (par/impar), URIs correctas, emite eventos
- [ ] Supply cap: revierte cuando `pairsMinted >= MAX_PAIRS`
- [ ] Soulbound: certificado no se puede transferir nunca
- [ ] Soulbound: coleccionable no se puede transferir antes de KYC
- [ ] `convertToTradeable()`: solo KYC_ROLE puede llamarlo, solo en IDs impares
- [ ] Transfer después de KYC: coleccionable sí se puede transferir
- [ ] Royalties: `royaltyInfo` retorna 0 para certificados, correcto para coleccionables
- [ ] `locked()`: true para certificados siempre, true para coleccionables sin KYC, false después
- [ ] Access control: solo MINTER puede mintear, solo KYC puede convertir, solo ADMIN puede upgradear
- [ ] Upgradeability: deploy via proxy, upgrade a V2 mock

### 1.4 Scripts de deploy
- `/contracts/scripts/deploy.ts` — deploy via proxy UUPS con `deployProxy()`
- `/contracts/scripts/grant-roles.ts` — otorga MINTER_ROLE al admin wallet existente (`ADMIN_WALLET_PRIVATE_KEY`)

### 1.5 Copiar ABI al app
Script `contract:copy-abi` que copia el ABI compilado a:
- `/lib/contracts/AlmanacCertificate.json`

---

## Fase 2: Schema de Base de Datos

### 2.1 Actualizar Prisma schema
**Modificar:** `/prisma/schema.prisma`

Nuevos enums:
```prisma
enum NFTTokenType {
  CERTIFICATE
  COLLECTIBLE
  @@map("nft_token_type")
}

enum KYCStatus {
  NONE
  PENDING
  APPROVED
  REJECTED
  @@map("kyc_status")
}
```

Nuevos campos en `EducationalNFT`:
```prisma
tokenType      NFTTokenType    @default(CERTIFICATE)
pairedTokenId  String?         // ID del registro DB del token hermano
pairedNft      EducationalNFT? @relation("NFTPair", fields: [pairedTokenId], references: [id])
pairedWith     EducationalNFT? @relation("NFTPair")
isTradeable    Boolean         @default(false)
kycStatus      KYCStatus       @default(NONE)
artistAddress  String?
royaltyBps     Int?            // basis points: 500 = 5%
```

Nuevos campos en `NFTCollection`:
```prisma
defaultArtistAddress  String?
defaultRoyaltyBps     Int?    @default(500)  // 5% default
maxPairs              Int?                   // coincide con MAX_PAIRS del contrato
```

### 2.2 Ejecutar migración
```bash
npx prisma migrate dev --name add_dual_mint_fields
```

Los registros NFT existentes quedan con defaults seguros (`CERTIFICATE`, `isTradeable: false`).

---

## Fase 3: Backend

### 3.1 Capa de interacción con el contrato
**Nuevo archivo:** `/lib/contracts/almanac-contract.ts`

Usa ethers.js (ya en el proyecto v5.8.0) directamente para llamar al contrato custom:

```typescript
// Funciones a exportar:
mintDual(contractAddress, to, certURI, collectURI, artistAddr, royaltyBps)
  → { certificateTokenId, collectibleTokenId, transactionHash }

convertToTradeable(contractAddress, tokenId)
  → transactionHash
```

Parsea el evento `DualMint` del receipt para extraer los dos token IDs.

### 3.2 Actualizar nft-service.ts
**Modificar:** `/lib/nft-service.ts`

Nueva función `mintDualNFT(params)`:
1. Obtiene la colección de la DB
2. Sube 2 objetos de metadata a IPFS via Pinata (certificado + coleccionable)
3. Llama `mintDual()` del contrato via `almanac-contract.ts`
4. Retorna `{ certificateTokenId, collectibleTokenId, certMetadataUri, collectMetadataUri, transactionHash }`

Mantener `mintEducationalNFT()` existente para backward compatibility con NFTs ya minteados.

### 3.3 Actualizar API de mint
**Modificar:** `/app/api/users/[userId]/nfts/mint/route.ts`

Cambios en `saveNFTToDatabase()`:
1. Crear 2 objetos de metadata (certificado y coleccionable comparten imagen, diferentes atributos)
2. Llamar `mintDualNFT()` en vez de `mintEducationalNFT()`
3. Guardar **2 registros** en DB dentro de una Prisma `$transaction`:
   - Crear certNFT sin `pairedTokenId`
   - Crear collectNFT con `pairedTokenId: certNFT.id`
   - Actualizar certNFT con `pairedTokenId: collectNFT.id`
4. Mismo costo en ZAPs (un mint = un par de tokens)

### 3.4 Actualizar admin test-mint
**Modificar:** `/app/api/admin/nfts/test-mint/route.ts`

Misma lógica dual-mint pero sin validación de ZAPs. Agregar `artistAddress` y `royaltyBps` al body de la request.

### 3.5 Endpoint de conversión KYC (placeholder)
**Nuevo archivo:** `/app/api/admin/nfts/convert-tradeable/route.ts`

```
POST { nftId: string }
1. Verificar sesión admin con KYC_ROLE
2. Buscar EducationalNFT, verificar tokenType=COLLECTIBLE y isTradeable=false
3. Llamar convertToTradeable() en el contrato
4. Actualizar DB: isTradeable=true, kycStatus=APPROVED
5. Retornar success
```

### 3.6 Actualizar endpoint de listado de NFTs
**Modificar:** `/app/api/users/[userId]/nfts/route.ts`

Agregar al `select`: `tokenType`, `isTradeable`, `pairedTokenId`, `kycStatus`.

---

## Fase 4: Frontend / Admin

### 4.1 Actualizar tipos TypeScript
Agregar a los tipos de NFT:
```typescript
tokenType: "CERTIFICATE" | "COLLECTIBLE"
pairedTokenId?: string
isTradeable: boolean
kycStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED"
artistAddress?: string
royaltyBps?: number
```

### 4.2 Formulario de colecciones (admin)
**Modificar:** `/components/admin/nft-collection-form.tsx`

Agregar campos:
- `defaultArtistAddress` — dirección del artista (0x...)
- `defaultRoyaltyBps` — porcentaje de royalties (ej: 500 = 5%)
- `maxPairs` — total de pares a mintear

Actualizar API en `/app/api/nft-collections/route.ts` para persistir estos campos.

### 4.3 Componentes de display de NFTs
**Modificar:** Componentes de NFT cards y páginas de detalle para mostrar:
- Badge de tipo: "Certificado" (icono escudo) o "Coleccionable" (icono gema)
- Estado soulbound: candado cerrado / abierto
- Info de royalties en coleccionables
- Link al token hermano

---

## Fase 5: Deploy y Testing

### 5.1 Tests del contrato
```bash
cd contracts && npx hardhat test
```
Todos los tests deben pasar antes de deployar.

### 5.2 Deploy a Polygon Amoy
```bash
# Compilar
cd contracts && npx hardhat compile

# Deploy proxy
npx hardhat run scripts/deploy.ts --network amoy

# Otorgar roles
npx hardhat run scripts/grant-roles.ts --network amoy

# Verificar en Polygonscan
npx hardhat verify --network amoy <implementation_address>
```

### 5.3 Actualizar variables de entorno
```env
ALMANAC_CONTRACT_ADDRESS=<proxy_address>
```
Crear nueva colección en la DB apuntando al nuevo contrato.

### 5.4 Testing de integración
- [ ] Flujo completo: completar curriculum → mint → verificar 2 tokens en blockchain + 2 registros en DB
- [ ] Certificado NO se puede transferir (revert en blockchain)
- [ ] Coleccionable NO se puede transferir sin KYC (revert en blockchain)
- [ ] Coleccionable SÍ se puede transferir después de `convertToTradeable()`
- [ ] `royaltyInfo()` retorna 0 para certificados
- [ ] `royaltyInfo()` retorna valores correctos para coleccionables
- [ ] Admin test-mint funciona con dual mint
- [ ] Endpoint de conversión KYC actualiza DB y llama al contrato

---

## Orden de ejecución

| # | Tarea | Archivos | Depende de |
|---|-------|----------|-----------|
| 1 | Inicializar Hardhat | `/contracts/` | — |
| 2 | Escribir contrato Solidity | `AlmanacCertificate.sol` | 1 |
| 3 | Escribir tests del contrato | `AlmanacCertificate.test.ts` | 2 |
| 4 | Scripts de deploy | `deploy.ts`, `grant-roles.ts` | 2 |
| 5 | Deploy a Polygon Amoy | — | 3, 4 |
| 6 | Copiar ABI | `/lib/contracts/AlmanacCertificate.json` | 5 |
| 7 | Migración Prisma | `schema.prisma` | — (paralelo) |
| 8 | Crear `almanac-contract.ts` | `/lib/contracts/almanac-contract.ts` | 6, 7 |
| 9 | Actualizar `nft-service.ts` | `/lib/nft-service.ts` | 8 |
| 10 | Actualizar API de mint | `mint/route.ts` | 9 |
| 11 | Actualizar admin test-mint | `test-mint/route.ts` | 9 |
| 12 | Crear endpoint KYC | `convert-tradeable/route.ts` | 8 |
| 13 | Actualizar tipos TS | `types.ts` | 7 |
| 14 | Actualizar frontend | NFT components | 10, 13 |
| 15 | Actualizar admin | Admin forms/pages | 10, 13 |
| 16 | Testing de integración | — | Todo |

---

## Decisión pendiente: Royalties split (Almanac + Artista)

ERC-2981 acepta UN solo receptor de royalties. Dos opciones:

**Opción A — PaymentSplitter on-chain** (automático, descentralizado)
- Desplegar un `PaymentSplitter` de OpenZeppelin por artista
- Pasar esa dirección como `artistAddress` en `mintDual()`
- Más complejo, requiere deploy extra por artista

**Opción B — Treasury único + split off-chain** (más simple, recomendado para empezar)
- Usar una sola dirección treasury de Almanac como receptor de royalties
- Distribuir al artista manualmente o via sistema propio fuera del contrato
- Más simple, sin contratos extra

**Recomendación**: Empezar con Opción B y agregar PaymentSplitter en iteración futura.

---

## Archivos a modificar (existentes)

| Archivo | Cambios |
|---------|---------|
| `/lib/nft-service.ts` | Agregar `mintDualNFT()`, mantener `mintEducationalNFT()` |
| `/prisma/schema.prisma` | Nuevos enums y campos en `EducationalNFT` y `NFTCollection` |
| `/app/api/users/[userId]/nfts/mint/route.ts` | Usar dual mint, guardar 2 registros |
| `/app/api/admin/nfts/test-mint/route.ts` | Usar dual mint |
| `/app/api/users/[userId]/nfts/route.ts` | Incluir nuevos campos en select |
| `/app/api/nft-collections/route.ts` | Aceptar nuevos campos |
| `/components/admin/nft-collection-form.tsx` | Campos de royalties y maxPairs |
| `package.json` | Scripts de Hardhat |

## Archivos nuevos a crear

| Archivo | Descripción |
|---------|-------------|
| `/contracts/package.json` | Config Hardhat |
| `/contracts/hardhat.config.ts` | Config Hardhat + Polygon Amoy |
| `/contracts/contracts/AlmanacCertificate.sol` | Contrato principal |
| `/contracts/test/AlmanacCertificate.test.ts` | Tests del contrato |
| `/contracts/scripts/deploy.ts` | Script de deploy |
| `/contracts/scripts/grant-roles.ts` | Script de roles |
| `/lib/contracts/AlmanacCertificate.json` | ABI compilado |
| `/lib/contracts/almanac-contract.ts` | Wrapper ethers.js |
| `/app/api/admin/nfts/convert-tradeable/route.ts` | Endpoint KYC |
