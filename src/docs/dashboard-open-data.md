# Dashboard de Consulta Comunitaria y Datos Abiertos

## Endpoints de ejemplo para backend futuro

### GET /api/jacs
Respuesta:
```json
{
  "data": [
    {
      "id": "jac-01",
      "nombre": "JAC San Francisco",
      "municipio": "Popayán",
      "tipoZona": "Urbana",
      "estado": "Activa"
    }
  ]
}
```

### GET /api/asocomunales
Respuesta:
```json
{
  "data": [
    {
      "id": "asocomunal-01",
      "nombre": "Asocomunal Popayán Central",
      "municipio": "Popayán",
      "jacsAfiliadas": ["JAC San Francisco", "JAC Nueva Esperanza"]
    }
  ]
}
```

### GET /api/estadisticas
Respuesta:
```json
{
  "totalJacsActivas": 45,
  "totalAsocomunales": 6,
  "totalMunicipios": 42,
  "urbanas": 35,
  "rurales": 15,
  "topMunicipios": [
    { "municipio": "Popayán", "jacs": 7 }
  ]
}
```

## Formato de respuestas JSON

- Todas las consultas públicas deben exponer solo datos permitidos.
- No incluir nombres de directivos, contactos, direcciones, NIT, correos, documentos ni enlaces a perfiles personales.

## Notas de seguridad y privacidad

- El dashboard es 100% público y sin autenticación.
- El único objetivo es transparencia de JAC y Asocomunales.
- Se mantiene una política de Privacidad por Diseño: solo datos agregados y campos públicos.
