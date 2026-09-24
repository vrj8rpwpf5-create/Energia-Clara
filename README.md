# Energía Clara · proyecto completo

Web estática multipágina de ahorro energético doméstico. No usa un framework ni necesita `package.json`: el código fuente, los estilos, la lógica de las calculadoras y las imágenes están en esta carpeta.

## Estructura

- `build_site.py`: genera las páginas HTML, las URL canónicas, `robots.txt` y `sitemap.xml`.
- `templates/tool-shell.html`: plantilla de las tres calculadoras solares conectadas.
- `dist/`: web lista para servir; contiene 14 páginas, CSS, JavaScript e imagen.
- `.openai/hosting.json`: configuración del sitio existente en Sites.
- `PENDIENTE-PARA-ADSENSE.md`: información que debe completar el propietario antes de solicitar anuncios.

## Regenerar

Ejecuta `python3 build_site.py` desde esta carpeta. Para verla localmente, sirve `dist/` con un servidor HTTP estático. Las rutas absolutas de los recursos no funcionan si abres las páginas directamente con `file://`.

`BASE` en `build_site.py` contiene el dominio previsto para el sitio existente. Cámbialo y regenera antes de usar un dominio propio.

**Estado:** proyecto local terminado. Esta versión no está publicada ni conectada con AdSense.
