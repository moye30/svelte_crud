<script lang="ts">
  let username = '';
  let password = '';
  let errorMessage = '';

  async function login() {
    // const response = await fetch('/api/login', {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      // Si el login es exitoso, redirigir al usuario a la pagina de inicio
      const data = await response.json();
      console.log('Login successful:', data);

      // Aqui se puede redirigir al usuario a la pagina de inicio o mostrar un mensaje de exito
      // Guardar el usuario en sessionStorage
      sessionStorage.setItem('user', JSON.stringify(data.user));
      // Redirigir al usuario a la pagina de productos
      window.location.href = '/products';
    } else {
      // En caso de error, mostrar un mensaje de error
      const data = await response.json();
      errorMessage = data.error;
    }
  }
</script>

<section class="login-container">
  <h1>Inicia Sesion</h1>
  <form class="login-form" on:submit|preventDefault={login}>
    <input class="form-input"
      type="text"
      bind:value={username}
      placeholder="Usuario" required />
    <input class="form-input"
      type="password"
      bind:value={password}
      placeholder="Contraseña" required />
    <button type="submit">Iniciar Sesion</button>
  </form>
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
</style>
