<script lang="ts">
  let email = '';
  let password = '';
  let role = 'client'; // Rol por defecto
  let errorMessage = '';
  let passwordError = '';
  let successMessage = '';

  // Validar email
  async function validateEmail() {
    // Validar que el email cumpla con el formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      successMessage = '';
      errorMessage = 'El email no es valido';
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

    errorMessage = '';
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
      successMessage = '';
      passwordError =
        'La contraseña debe tener al menos 12 caracteres, una letra mayuscula, un numero y un caracter especial';
      return;
    }

    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password, role }),
    });

    if (response.ok) {
      // Registro exitoso
      const data = await response.json();
      console.log('Registration successful:', data);
      // Aqui se puede redirigir al usuario a la pagina de inicio o mostrar un mensaje de exito
      successMessage = 'Usuario registrado exitosamente';
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
      style={errorMessage ? 'border: 1px solid red' : ''}
      type="text"
      bind:value={email}
      placeholder="Correo electronico"
      required
    />
    <input
      class="form-input"
      style={passwordError ? 'border: 1px solid red' : ''}
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

  .error-msg {
    font-size: 16px;
    color: red;
    margin-bottom: 10px;
  }
</style>
