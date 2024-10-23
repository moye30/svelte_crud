<script lang="ts">
  let email = "";
  let password = "";
  let role = "client"; // Rol por defecto
  let errorMessage = "";
  let passwordError = "";
  let successMessage = "";

  // Validar email
  async function validateEmail() {
    // Validar que el email cumpla con el formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      successMessage = "";
      errorMessage = "El email no es valido";
      return;
    }

    // Validar que el email no este registrado
    // const response = await fetch('http://localhost:3000/api/validate-email', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ email }),
    // });
    //
    // if (response.ok) {
    //   const data = await response.json();
    //   if (data.exists) {
    //     errorMessage = 'El email ya esta registrado';
    //   }
    // } else {
    //   errorMessage = 'Error al validar el email';
    // }

    errorMessage = "";
  }

  function isValidPassword(password: string): boolean {
    return (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  async function register() {
    email = email.toLowerCase().trim();
    // Validar email
    await validateEmail();
    if (errorMessage) return;

    // Validar contraseña
    if (!isValidPassword(password)) {
      successMessage = "";
      passwordError =
        "La contraseña debe tener al menos 12 caracteres, una letra mayuscula, un numero y un caracter especial";
      return;
    }

    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password, role }),
    });

    if (response.ok) {
      // Registro exitoso
      const data = await response.json();
      console.log("Registration successful:", data);
      // Aqui se puede redirigir al usuario a la pagina de inicio o mostrar un mensaje de exito
      successMessage = "Usuario registrado exitosamente";
    } else {
      // En caso de error, mostrar un mensaje de error
      const data = await response.json();
      errorMessage = data.error;
    }
  }
</script>

<section class="register-container">
  <h1 class="register-title">Registrar Usuario</h1>

  <form class="register-form" on:submit|preventDefault={register}>
    <span style="color: green;">{successMessage}</span>
    <span class="error-msg">{errorMessage}</span>
    <span class="error-msg">{passwordError}</span>
    <input
      class="form-input"
      style={errorMessage ? "border: 1px solid red" : ""}
      type="text"
      bind:value={email}
      placeholder="Correo electronico"
      required
    />
    <input
      class="form-input"
      style={passwordError ? "border: 1px solid red" : ""}
      type="password"
      bind:value={password}
      placeholder="Contraseña"
      required
    />
    <select class="role-selection" bind:value={role}>
      <option value="client">Cliente</option>
      <option value="admin">Administrador</option>
    </select>
    <button type="submit">Registrar</button>
  </form>

  <div class="login-container">
    <a href="/login">
      Ya tienes cuenta? <span style="color: #31748f;">Inicia Sesion</span>
    </a>
  </div>
</section>

<style>
  .register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* Centra verticalmente */
    height: 100vh;
    background-color: #f9f9fb; /* Fondo suave */
    padding: 20px; /* Espaciado interior */
    border-radius: 10px; /* Bordes redondeados */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Sombra suave */
  }

  .register-container h1 {
    margin-bottom: 30px; /* Espacio debajo del título */
    font-size: 2.5rem; /* Tamaño de fuente más grande */
    color: #4a4e69; /* Color de texto atractivo */
    text-align: center; /* Centra el texto */
    font-weight: bold; /* Negrita */
  }

  .register-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%; /* Ancho completo */
    max-width: 400px; /* Ancho máximo */
    background-color: white; /* Fondo blanco para el formulario */
    padding: 20px; /* Espaciado interior */
    border-radius: 10px; /* Bordes redondeados */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Sombra */
  }

  .register-form .form-input {
    margin-bottom: 20px; /* Espacio entre campos */
    padding: 12px; /* Mayor espaciado interior */
    width: 100%; /* Ancho completo */
    border: 2px solid #ccc; /* Borde más prominente */
    border-radius: 5px; /* Bordes redondeados */
    font-size: 1rem; /* Tamaño de fuente */
    transition: border-color 0.3s; /* Transición suave para el borde */
  }

  .register-form .form-input:focus {
    outline: none; /* Quitar el contorno al hacer foco */
    border-color: #2e86ab; /* Color del borde al enfocar */
  }

  .register-form button {
    padding: 12px; /* Espaciado interior */
    width: 100%; /* Ancho completo */
    border: none; /* Sin borde */
    border-radius: 5px; /* Bordes redondeados */
    background-color: #2e86ab; /* Color de fondo */
    color: white; /* Color de texto */
    font-size: 1.2rem; /* Tamaño de fuente */
    cursor: pointer; /* Cambiar cursor al pasar sobre el botón */
    transition:
      background-color 0.3s,
      transform 0.3s; /* Transiciones suaves */
  }

  .register-form button:hover {
    background-color: #1b6f93; /* Color más oscuro al pasar el cursor */
    transform: scale(1.05); /* Aumento al pasar el cursor */
  }

  .role-selection {
    margin-bottom: 20px; /* Espacio debajo de la selección de rol */
    padding: 12px; /* Espaciado interior */
    width: 100%; /* Ancho completo */
    border: 2px solid #ccc; /* Borde más prominente */
    border-radius: 5px; /* Bordes redondeados */
    font-size: 1rem; /* Tamaño de fuente */
  }

  .login-container {
    margin-top: 20px; /* Espacio encima del contenedor de login */
  }

  .login-container a {
    text-decoration: none; /* Sin subrayado */
    color: #575279; /* Color de texto */
    font-weight: bold; /* Negrita */
  }

  .login-container a span {
    color: #2e86ab; /* Color del texto destacado */
  }

  .login-container a:hover span {
    text-decoration: underline; /* Subrayar al pasar el cursor */
  }

  .error-msg {
    font-size: 16px; /* Tamaño de fuente */
    color: #e74c3c; /* Color de error más atractivo */
    margin-bottom: 10px; /* Espacio debajo del mensaje de error */
    font-weight: bold; /* Negrita */
  }
</style>
