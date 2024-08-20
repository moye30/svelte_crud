<script lang="ts">
  let username = '';
  let password = '';
  let role = 'client'; // Rol por defecto
  let errorMessage = '';

  async function register() {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });

    if (response.ok) {
      // Registro exitoso
      const data = await response.json();
      console.log('Registration successful:', data);
      // Aqui se puede redirigir al usuario a la pagina de inicio o mostrar un mensaje de exito
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
    <input class="form-input" type="text" bind:value={username} placeholder="Nombre de usuario" required />
    <input class="form-input" type="password" bind:value={password} placeholder="Contraseña" required />
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
    height: 100vh;
    margin-top: 50px;
  }

  .register-container h1 {
    align-items: center;
    margin-bottom: 20px;
    font-size: 3rem;
    color: #31748f;
  }

  .register-form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .register-form .form-input {
    margin-bottom: 10px;
    padding: 10px;
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .register-form .form-input:focus {
    outline: none;
    border: 1px solid #31748f;
    transition: border 0.3s;
  }

  .register-form button {
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

  .register-form button:hover {
    transform: scale(1.05);
    transition: transform 0.3s;
  }

  .role-selection {
    margin-bottom: 10px;
    padding: 10px;
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .login-container {
    margin-top: 20px;
  }

  .login-container a {
    text-decoration: none;
    color: #575279;
  }

  .login-container a span {
    color: #31748f;
  }

  .login-container a:hover span {
    text-decoration: underline;
  }
</style>
