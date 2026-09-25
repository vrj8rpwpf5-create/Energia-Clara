# CalculaWatt

Web estática multipágina de ahorro energético doméstico. No usa un framework ni necesita `package.json`: el código fuente, los estilos, la lógica de las calculadoras y las imágenes están en esta carpeta.

## Estructura

- `build_site.py`: genera las páginas HTML, las URL canónicas, `robots.txt` y `sitemap.xml`.
- `templates/tool-shell.html`: plantilla de las tres calculadoras solares conectadas.
- `legal_content.py`: textos del Aviso Legal y políticas de privacidad y cookies.
- `assets/consent.js` y `assets/consent.css`: preferencias y presentación del banner.
- `dist/`: web generada lista para servir; contiene 17 páginas, CSS, JavaScript e imagen.
- `.openai/hosting.json`: configuración del sitio existente en Sites.
- `PENDIENTE-PARA-ADSENSE.md`: información que debe completar el propietario antes de solicitar anuncios.

## Regenerar

Ejecuta `python3 build_site.py` desde esta carpeta. Para verla localmente, sirve `dist/` con un servidor HTTP estático. Las rutas absolutas de los recursos no funcionan si abres las páginas directamente con `file://`.

`BASE` en `build_site.py` contiene el dominio previsto para el sitio existente. Cámbialo y regenera antes de usar un dominio propio.

El generador fija las cuatro señales de Consent Mode en `denied` antes de cualquier etiqueta de Google. La etiqueta de Analytics solo se carga tras aceptar las analíticas. Aceptar no activa publicidad: requiere una CMP certificada e integración específica antes de instalar AdSense. El footer permite cambiar o revocar las preferencias.

El titular completó los datos identificativos en `legal_content.py`. Antes de considerar cerrado el canal de contacto, activa y prueba la recepción de `contacto@calculawatt.com`; consulta `PENDIENTE-PARA-ADSENSE.md` para los pasos de monetización.
