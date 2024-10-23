<script lang="ts">
  import { onMount } from "svelte";

  let email = "";
  let password = "";
  let errorMessage = "";
  let otp = "";
  let otpSent = false;

  onMount(async () => {
    try {
      const userResponse = await fetch("http://localhost:3000/api/auth/check", {
        method: "GET",
        credentials: "include", // Enviar cookies
      });

      if (userResponse.ok) {
        console.log("User is logged in");
        const user = await userResponse.json();
        console.log("User:", user);
        window.location.href = "/products";
      }
    } catch (error) {
      console.error("Failed to check user authentication");
    }
  });

  async function login() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log("User logged in, OTP sent");
        otpSent = true;
      } else {
        errorMessage = "Correo electronico o contraseña incorrectos";
      }
    } catch (error) {
      errorMessage = "Error al iniciar sesion";
    }
  }

  async function verifyOtp() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ otp }),
        }
      );

      if (response.ok) {
        errorMessage = "";
        window.location.href = "/products";
      } else {
        errorMessage = "OTP incorrecto";
      }
    } catch (error) {
      errorMessage = "No se pudo enviar OTP";
    }
  }

  function toggleOtp() {
    otpSent = !otpSent;
  }
</script>

<section class="login-container">
  {#if !otpSent}
    <h1>Inicia Sesion</h1>
    <form class="login-form" on:submit|preventDefault={login}>
      <input
        class="form-input"
        type="text"
        bind:value={email}
        placeholder="Correo electronico"
        required
      />
      <input
        class="form-input"
        type="password"
        bind:value={password}
        placeholder="Contraseña"
        required
      />
      <button type="submit">Iniciar Sesion</button>
    </form>
  {:else}
    <div class="otp-form">
      <h1>Verificar OTP</h1>
      <p>Se ha enviado un OTP a su correo electronico</p>
      <p>Por favor, ingrese el OTP para verificar su identidad</p>
      <input
        class="form-input"
        type="text"
        bind:value={otp}
        placeholder="OTP"
        required
      />
      <button on:click={verifyOtp}>Verificar OTP</button>
      <button on:click={toggleOtp}>Volver</button>
    </div>
  {/if}

  {#if errorMessage}
    <p class="error-msg">{errorMessage}</p>
  {/if}

  <div class="register-container">
    <a href="/register">
      ¿No tiene cuenta? <span style="color: #31748f;">Registrate</span>
    </a>
  </div>
</section>

<style>
  .login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* Centrar verticalmente */
    height: 100vh;
    background-color: #f9f9fb; /* Fondo suave */
    padding: 20px; /* Espaciado interior */
    border-radius: 10px; /* Bordes redondeados */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Sombra suave */
  }

  .login-container h1 {
    margin-bottom: 30px; /* Espacio debajo del título */
    font-size: 2.5rem; /* Tamaño de fuente más grande */
    color: #4a4e69; /* Color de texto atractivo */
    text-align: center; /* Centra el texto */
    font-weight: bold; /* Negrita */
  }

  .login-form {
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

  .login-form .form-input {
    margin-bottom: 20px; /* Espacio entre campos */
    padding: 12px; /* Mayor espaciado interior */
    width: 100%; /* Ancho completo */
    border: 2px solid #ccc; /* Borde más prominente */
    border-radius: 5px; /* Bordes redondeados */
    font-size: 1rem; /* Tamaño de fuente */
    transition: border-color 0.3s; /* Transición suave para el borde */
  }

  .login-form .form-input:focus {
    outline: none; /* Quitar el contorno al hacer foco */
    border-color: #2e86ab; /* Color del borde al enfocar */
  }

  .login-form button {
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

  .login-form button:hover {
    background-color: #1b6f93; /* Color más oscuro al pasar el cursor */
    transform: scale(1.05); /* Aumento al pasar el cursor */
  }

  .register-container {
    margin-top: 20px; /* Espacio encima del contenedor de registro */
  }

  .register-container a {
    text-decoration: none; /* Sin subrayado */
    color: #575279; /* Color de texto */
    font-weight: bold; /* Negrita */
  }

  .register-container a span {
    color: #2e86ab; /* Color del texto destacado */
  }

  .register-container a:hover span {
    text-decoration: underline; /* Subrayar al pasar el cursor */
  }

  .error-msg {
    margin-top: 20px; /* Espacio encima del mensaje de error */
    color: #e74c3c; /* Color de error más atractivo */
    font-size: 1rem; /* Tamaño de fuente */
    font-weight: bold; /* Negrita */
  }

  .otp-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%; /* Ancho completo */
    max-width: 400px; /* Ancho máximo */
  }

  .otp-form h1 {
    margin-bottom: 30px; /* Espacio debajo del título */
    font-size: 2.5rem; /* Tamaño de fuente más grande */
    color: #4a4e69; /* Color de texto atractivo */
    text-align: center; /* Centra el texto */
    font-weight: bold; /* Negrita */
  }

  .otp-form p {
    margin-bottom: 10px; /* Espacio debajo del párrafo */
    font-size: 1.2rem; /* Tamaño de fuente */
    color: #575279; /* Color de texto */
  }

  .otp-form .form-input {
    margin-bottom: 20px; /* Espacio entre campos */
    padding: 12px; /* Mayor espaciado interior */
    width: 100%; /* Ancho completo */
    border: 2px solid #ccc; /* Borde más prominente */
    border-radius: 5px; /* Bordes redondeados */
    font-size: 1rem; /* Tamaño de fuente */
    transition: border-color 0.3s; /* Transición suave para el borde */
  }

  .otp-form .form-input:focus {
    outline: none; /* Quitar el contorno al hacer foco */
    border-color: #2e86ab; /* Color del borde al enfocar */
  }

  .otp-form button {
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
    margin-bottom: 10px; /* Espaciado entre botones */
  }

  .otp-form button:hover {
    background-color: #1b6f93; /* Color más oscuro al pasar el cursor */
    transform: scale(1.05); /* Aumento al pasar el cursor */
  }
</style>
