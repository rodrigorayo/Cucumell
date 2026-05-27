# Guía de Configuración de Backend (Supabase) - Cucumell

Esta guía te guiará paso a paso para configurar tu base de datos y panel de administración en **Supabase** de forma gratuita en menos de 5 minutos.

---

## Paso 1: Crear una Cuenta y un Proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y regístrate (puedes iniciar sesión con tu cuenta de GitHub o correo electrónico).
2. Haz clic en el botón **"New Project"** (Nuevo Proyecto).
3. Rellena los datos del formulario:
   - **Name (Nombre):** `Cucumell`
   - **Database Password (Contraseña de Base de Datos):** Crea una contraseña segura (guárdala bien, aunque no la necesitarás para el panel).
   - **Region:** Selecciona `South America (São Paulo)` o la región más cercana a Bolivia para mayor velocidad.
   - **Pricing Plan (Plan):** Elige el **Free Plan** (Plan Gratuito).
4. Haz clic en **"Create new project"** y espera unos 2 minutos a que la base de datos se configure por completo.

---

## Paso 2: Configurar las Tablas y Reglas de Seguridad (SQL)

Una vez que tu proyecto esté listo (verás la pantalla de inicio del panel de Supabase):

1. En el menú de la izquierda, busca el icono de **"SQL Editor"** (tiene forma de cuadro con texto `SQL`).
2. Haz clic en **"New query"** (Nueva consulta) o **"Create a new query"**.
3. Abre el archivo [db_setup.sql](file:///c:/Users/rodri/Desktop/CoockiesWeb/db_setup.sql) de tu carpeta del proyecto, **copia todo su contenido** y **pégalo** en el editor de Supabase.
4. Haz clic en el botón **"Run"** (o presiona `Ctrl + Enter`).
5. Abajo debería salir el mensaje `Success. No rows returned.` o similar. Esto significa que las tablas, las fotos y las reglas de seguridad han sido creadas perfectamente.

---

## Paso 3: Crear tu Usuario Administrador (Para iniciar sesión)

Para poder ingresar al panel `/admin/` de la web, necesitas crearte una cuenta de acceso:

1. En el menú de la izquierda de Supabase, entra a la sección de **"Authentication"** (icono de candado o persona).
2. Asegúrate de estar en la pestaña **"Users"** y haz clic en el botón **"Add user"** -> **"Create user"**.
3. Rellena los campos:
   - **Email:** El correo con el que quieres iniciar sesión (ej: `admin@cucumell.com`).
   - **Password:** Tu contraseña para el panel.
   - **Auto-confirm User:** **Activa esta casilla** (importante para que no tengas que ir a confirmar el correo electrónico y puedas iniciar sesión inmediatamente).
4. Haz clic en **"Save"**. ¡Listo! Ya tienes tu usuario administrador.

---

## Paso 4: Conectar la Web con tu Supabase

Por último, conecta los archivos de tu computadora a tu nuevo backend:

1. Ve a **"Project Settings"** (icono de engranaje en la esquina inferior izquierda de Supabase) y luego entra a **"API"**.
2. Copia los siguientes datos:
   - **Project URL:** Copia la URL (ej: `https://xyzabc.supabase.co`).
   - **Project API keys (anon / public):** Copia la clave marcada como `anon` y `public` (es una cadena larga de letras y números).
3. Abre el archivo [config.js](file:///c:/Users/rodri/Desktop/CoockiesWeb/config.js) en tu editor de código y pega las claves entre las comillas correspondientes:

   ```javascript
   const SUPABASE_URL = "PEGAR_AQUI_TU_PROJECT_URL";
   const SUPABASE_ANON_KEY = "PEGAR_AQUI_TU_ANON_PUBLIC_KEY";
   ```

4. Guarda el archivo `config.js`.

---

## Paso 5: ¡Listo para Desplegar!

¡Ya está todo configurado!
* Si abres `index.html` en tu navegador, ahora cargará las galletas directamente desde la base de datos de Supabase en lugar del código fijo.
* Si entras a `tuweb.com/admin` (o abres `/admin/login.html` en tu navegador), podrás iniciar sesión con el correo y contraseña que creaste en el **Paso 3**.
* Desde el panel administrativo podrás subir imágenes desde tu celular o computadora, y los precios o productos se actualizarán al instante en tu web.

Ahora puedes subir toda la carpeta a **Vercel** o **Netlify** para tenerla publicada en internet. ¡Felicidades!
