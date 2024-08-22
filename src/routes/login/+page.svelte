<script lang="ts">
  import { onMount } from "svelte";

  let email = '';
  let password = '';
  let errorMessage = '';
  let otp = '';
  let otpSent = false;

  onMount(async() => {
    try {
      const userResponse = await fetch('http://localhost:3000/api/auth/check', {
        method: 'GET',
        credentials: 'include', // Enviar cookies
      });

      if (userResponse.ok) {
        console.log('User is logged in');
        const user = await userResponse.json();
        console.log('User:', user);
        window.location.href = '/products';
      }
    } catch (error) {
      console.error('Failed to check user authentication');
    }
  });

  async function login() {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log('User logged in, OTP sent');
        otpSent = true;
      } else {
        errorMessage = 'Correo electronico o contraseña incorrectos';
      }
    } catch (error) {
      errorMessage = 'Error al iniciar sesion';
    }
  }

  async function verifyOtp() {
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ otp })
      });

      if (response.ok) {
        errorMessage = '';
        window.location.href = '/products';
      } else {
        errorMessage = 'OTP incorrecto';
      }
    } catch (error) {
      errorMessage = 'No se pudo enviar OTP';
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
      <input class="form-input"
        type="text"
        bind:value={email}
        placeholder="Correo electronico" required />
      <input class="form-input"
        type="password"
        bind:value={password}
        placeholder="Contraseña" required />
      <button type="submit">Iniciar Sesion</button>
    </form>
  {:else}
    <div class="otp-form">
      <h1>Verificar OTP</h1>
      <p>Se ha enviado un OTP a su correo electronico</p>
      <p>Por favor, ingrese el OTP para verificar su identidad</p>
      <input class="form-input"
        type="text"
        bind:value={otp}
        placeholder="OTP" required />
      <button on:click={verifyOtp}>Verificar OTP</button>
      <button on:click={toggleOtp}>Volver</button>
    </div>
  {/if}

  {#if errorMessage}
    <p class="error-msg">{errorMessage}</p>
  {/if}

  <div class="register-container">
    <a href="/register">
      No tiene cuenta? <span style="color: #31748f;">Registrate</span>
    </a>
</section>

<style>
  .login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    margin-top: 50px;
  }

  .login-container h1 {
    margin-bottom: 20px;
    font-size: 3rem;
    color: #31748f;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login-form .form-input {
    margin-bottom: 10px;
    padding: 10px;
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .login-form .form-input:focus {
    outline: none;
    border: 1px solid #31748f;
    transition: border 0.3s;
  }

  .login-form button {
    margin-top: 1.2rem;
    padding: 10px;
    width: 300px;
    border: none;
    border-radius: 5px;
    background-color: #31748f;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .login-form button:hover {
    transform: scale(1.05);
    transition: transform 0.3s;
  }

  .register-container {
    margin-top: 20px;
  }

  .register-container a {
    text-decoration: none;
    color: #575279;
  }

  .register-container a span {
    color: #31748f;
  }

  .register-container a:hover span {
    text-decoration: underline;
  }

  .error-msg {
    margin-top: 20px;
    color: red;
  }

  .otp-form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .otp-form h1 {
    margin-bottom: 20px;
    font-size: 3rem;
    color: #31748f;
  }

  .otp-form p {
    margin-bottom: 10px;
    font-size: 1.2rem;
  }

  .otp-form .form-input {
    margin-bottom: 10px;
    padding: 10px;
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .otp-form .form-input:focus {
    outline: none;
    border: 1px solid #31748f;
    transition: border 0.3s;
  }

  .otp-form button {
    margin-top: 1.2rem;
    padding: 10px;
    width: 300px;
    border: none;
    border-radius: 5px;
    background-color: #31748f;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .otp-form button:hover {
    transform: scale(1.05);
    transition: transform 0.3s;
  }
</style>
