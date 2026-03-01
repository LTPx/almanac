# Plan: NFT Certificados + Coleccionables en Polygon Amoy

## Contexto
La app Almanac actualmente mintea NFTs ERC-721 simples en Polygon Amoy via ThirdWeb SDK. El cliente requiere: seguridad reforzada, royalties para el artista, tokens soulbound (certificados), coleccionables tradeables, y supply fijo.

Se implementaron **2 contratos custom** (no dual mint en un solo contrato):
- **AlmanacCertificate**: soulbound permanente, no burn, sin royalties
- **AlmanacCollectible**: tradeable desde mint, con royalties ERC-2981

---

## Actores

| Actor | Rol |
|-------|-----|
| **Admin / Content Manager** | Carga colecciones e imagenes (off-chain) |
| **Author** | Creador de la imagen, tiene wallet para royalties |
| **Usuario** | Nino/adolescente/adulto que aprende y gana ZAPs |
| **Representante/Guardian** | Solo menores: autoriza que el NFT tradeable se mintee |
| **Backend App** | Orquesta ZAPs, random, autorizacion, transacciones |
| **Relayer/Minter Wallet** | Wallet con MATIC que paga gas y llama al contrato |

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

| | AlmanacCertificate | AlmanacCollectible |
|---|---|---|
| **Transferible** | No (soulbound permanente) | Si (tradeable desde mint) |
| **Quemable** | No | Si (ERC-721 default) |
| **Royalties** | No | Si (ERC-2981, al authorWallet) |
| **Supply** | MAX_SUPPLY fijo | Mismo MAX_SUPPLY |
| **Cuando se mintea** | Al completar test | Cuando usuario solicita + autorizacion |
| **ERC-5192** | Si (locked = true siempre) | No |
| **Verificacion on-chain** | - | Verifica ownership del certificado |
| **Relacion 1:1** | - | Un coleccionable por certificado (certificateClaimed) |
| **Storage gap** | Si (__gap[50]) | Si (__gap[50]) |

### Contratos desplegados (Polygon Amoy Testnet)

| Contrato | Proxy | Implementation |
|----------|-------|---------------|
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
| Archivo | Descripcion |
|---------|-------------|
| `/contracts/package.json` | Config Hardhat |
| `/contracts/hardhat.config.ts` | Config Hardhat + Polygon Amoy + Etherscan V2 |
| `/contracts/contracts/AlmanacCertificate.sol` | Contrato certificado soulbound |
| `/contracts/contracts/AlmanacCollectible.sol` | Contrato coleccionable tradeable |
| `/contracts/test/AlmanacCertificate.test.ts` | 23 tests |
| `/contracts/test/AlmanacCollectible.test.ts` | 33 tests |
| `/contracts/scripts/deploy.ts` | Deploy ambos contratos via UUPS |
| `/contracts/scripts/grant-roles.ts` | Otorga MINTER_ROLE al admin wallet |
| `/contracts/scripts/copy-abi.js` | Copia ABIs a /lib/contracts/ |
| `/lib/contracts/AlmanacCertificate.json` | ABI compilado |
| `/lib/contracts/AlmanacCollectible.json` | ABI compilado |

---

## Fase 2: Schema de Base de Datos — PENDIENTE

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

## Fase 3: Backend — PENDIENTE

### 3.1 Capa de interaccion con los contratos
**Nuevo archivo:** `/lib/contracts/almanac-contract.ts`

Usa ethers.js (v5.8.0, ya en el proyecto) para llamar a los contratos custom:

```typescript
// Funciones a exportar:

// Certificado — se llama cuando el usuario completa un test
mintCertificate(contractAddress, to, uri)
  → { tokenId, transactionHash }

// Coleccionable — se llama cuando el usuario solicita + autorizacion
mintCollectible(contractAddress, to, uri, linkedCertId, authorWallet, royaltyBps)
  → { tokenId, transactionHash }
```

### 3.2 Actualizar nft-service.ts
**Modificar:** `/lib/nft-service.ts`

- Nueva funcion `mintCertificateNFT(params)`: obtiene coleccion, crea metadata, llama mintCertificate()
- Nueva funcion `mintCollectibleNFT(params)`: obtiene coleccion, crea metadata, llama mintCollectible()
- Mantener `mintEducationalNFT()` existente para backward compatibility

### 3.3 Actualizar API de mint (certificado)
**Modificar:** `/app/api/users/[userId]/nfts/mint/route.ts`

- Llamar `mintCertificateNFT()` en vez de `mintEducationalNFT()`
- Guardar 1 registro en DB con `tokenType: CERTIFICATE`, `isTradeable: false`

### 3.4 Crear API de mint (coleccionable)
**Nuevo archivo:** `/app/api/users/[userId]/nfts/mint-collectible/route.ts`

```
POST { certificateNftId: string }
1. Verificar que el usuario posee el certificado en la DB
2. Verificar autorizacion (menor: guardian aprobado / mayor: directo)
3. Obtener coleccion y datos del artista
4. Llamar mintCollectibleNFT()
5. Guardar registro en DB con tokenType: COLLECTIBLE, isTradeable: true
6. Retornar resultado
```

### 3.5 Actualizar admin test-mint
**Modificar:** `/app/api/admin/nfts/test-mint/route.ts`

Agregar soporte para mintear certificados y coleccionables de test.

### 3.6 Actualizar endpoint de listado de NFTs
**Modificar:** `/app/api/users/[userId]/nfts/route.ts`

Agregar al `select`: `tokenType`, `isTradeable`, `linkedCertTokenId`.

---

## Fase 4: Frontend / Admin — PENDIENTE

### 4.1 Actualizar tipos TypeScript
Agregar a los tipos de NFT:
```typescript
tokenType: "CERTIFICATE" | "COLLECTIBLE"
isTradeable: boolean
linkedCertTokenId?: string
artistAddress?: string
royaltyBps?: number
```

### 4.2 Formulario de colecciones (admin)
**Modificar:** `/components/admin/nft-collection-form.tsx`

Agregar campos:
- `defaultArtistAddress` — wallet del artista (0x...)
- `defaultRoyaltyBps` — porcentaje de royalties (ej: 500 = 5%)
- `maxSupply` — total de NFTs a emitir
- `certificateContractAddress` — address del contrato de certificados
- `collectibleContractAddress` — address del contrato de coleccionables

Actualizar API en `/app/api/nft-collections/route.ts`.

### 4.3 Componentes de display de NFTs
**Modificar:** Componentes de NFT cards y paginas de detalle para mostrar:
- Badge de tipo: "Certificado" (soulbound) o "Coleccionable" (tradeable)
- Info de royalties en coleccionables
- Boton "Solicitar coleccionable" en la vista del certificado

---

## Fase 5: Testing de integracion — PENDIENTE

### 5.1 Testing de integracion
- [ ] Flujo certificado: completar curriculum → mint → verificar token en blockchain + registro en DB
- [ ] Certificado NO se puede transferir (revert en blockchain)
- [ ] Certificado NO se puede quemar (revert en blockchain)
- [ ] Flujo coleccionable: solicitar → autorizacion → mint → verificar en blockchain + DB
- [ ] Coleccionable verifica ownership del certificado on-chain
- [ ] Coleccionable es 1:1 (no se puede reclamar dos veces el mismo certificado)
- [ ] `royaltyInfo()` retorna valores correctos para coleccionables
- [ ] Admin test-mint funciona para ambos tipos
- [ ] Transferencia de coleccionable funciona (usuario puede vender)

---

## Orden de ejecucion

| # | Tarea | Estado | Archivos |
|---|-------|--------|----------|
| 1 | Inicializar Hardhat | COMPLETADO | `/contracts/` |
| 2 | Escribir contratos Solidity | COMPLETADO | `AlmanacCertificate.sol`, `AlmanacCollectible.sol` |
| 3 | Escribir tests | COMPLETADO | 56 tests pasando |
| 4 | Scripts de deploy | COMPLETADO | `deploy.ts`, `grant-roles.ts` |
| 5 | Deploy a Polygon Amoy | COMPLETADO | Ambos contratos desplegados y verificados |
| 6 | Copiar ABIs | COMPLETADO | `/lib/contracts/*.json` |
| 7 | Migracion Prisma | PENDIENTE | `schema.prisma` |
| 8 | Crear `almanac-contract.ts` | PENDIENTE | `/lib/contracts/almanac-contract.ts` |
| 9 | Actualizar `nft-service.ts` | PENDIENTE | `/lib/nft-service.ts` |
| 10 | Actualizar API de mint (certificado) | PENDIENTE | `mint/route.ts` |
| 11 | Crear API de mint (coleccionable) | PENDIENTE | `mint-collectible/route.ts` |
| 12 | Actualizar admin test-mint | PENDIENTE | `test-mint/route.ts` |
| 13 | Actualizar tipos TS | PENDIENTE | Tipos de NFT |
| 14 | Actualizar frontend | PENDIENTE | NFT components |
| 15 | Actualizar admin | PENDIENTE | Admin forms/pages |
| 16 | Testing de integracion | PENDIENTE | — |

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
- [x] Storage gap (__gap[50]) en ambos contratos
