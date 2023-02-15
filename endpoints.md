PORT: 9917

GET /api/area/ ({areaId}) (binFile) <- get area pic

GET /api/mapOriginal/ ({}) (binFile) <- get orig map pic
GET /api/mapMinted/ ({}) (binFile) <- get minted cells map pic
GET /api/mapFree/ ({}) (binFile) <- get free cells map pic
GET /api/mapEdited/ ({}) (binFile) <- get edited map pic

GET /api/status/ ({}) ({status, data}) <- get bigArray data (10k cells data)

POST /api/paid/ ({ids, wallet, hash}) ({status}) <- set cell as paid
POST /api/reserve/ ({ids}) ({status}) <- set cell as reserved
POST /api/unreserve/ ({ids}) ({status}) <- unreserve cell (set cell as free)
POST /api/update/ ({signature, publicKey, wallet, ids, image, username, text, link}) ({status}) <- update cell data