<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let products: any[] = [];
  let userRole = "";
  let errorMessage = "";

  let name = "";
  let description = "";
  let price: number | null = null;
  let image = "";

  // Editar productos
  let editingProductId: number | null = null;
  let editingName = "";
  let editingDescription = "";
  let editingPrice: number | null = null;
  let editingImage = "";

  async function startEditProduct(product: any) {
    editingProductId = product.id;
    editingName = product.name;
    editingDescription = product.description;
    editingPrice = product.price;
    editingImage = product.image;
  }

  onMount(async () => {
    try {
      const userResponse = await fetch("http://localhost:3000/api/auth/check", {
        method: "GET",
        credentials: "include", // Enviar cookies
      });

      if (userResponse.ok) {
        console.log("User is logged in");
        const user = await userResponse.json();
        userRole = user.userRole;
        console.log("User role:", userRole);
        console.log("User:", user);
        await loadProducts();
      } else {
        console.log("User is not logged in");
        goto("/login");
      }
    } catch (error) {
      console.error("Failed to check user authentication");
      goto("/login");
    }
  });

  // Cerrar la sesion
  function logout() {
    fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      goto("/login");
    });
  }

  async function loadProducts() {
    try {
      const response = await fetch("http://localhost:3000/api/products");
      products = await response.json();
    } catch (error) {
      errorMessage = "Failed to load products";
    }
  }

  // Funcion para agregar un producto
  async function addProduct() {
    if (!name || !description || price === null) {
      errorMessage = "Please fill in all fields";
      return;
    }

    try {
      // Enviar la peticion POST al servidor
      const response = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, price, image }),
      });

      // Si la peticion fue exitosa, agregar el nuevo producto a la lista
      if (response.ok) {
        const newProduct = await response.json();
        products.push(newProduct);
        loadProducts(); // Reload products after adding
        name = "";
        description = "";
        price = null;
        image = "";
      } else {
        errorMessage = "Failed to add product";
      }
    } catch (error) {
      errorMessage = "Failed to add product";
    }
  }

  async function saveProduct() {
    if (editingProductId === null) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/products/${editingProductId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingName,
            description: editingDescription,
            price: editingPrice,
            image: editingImage,
          }),
        }
      );

      if (response.ok) {
        await loadProducts(); // Reload products after update
        editingProductId = null; // Clear editing state
      } else {
        errorMessage = "Failed to update product";
      }
    } catch (error) {
      errorMessage = "Failed to update product";
    }
  }

  async function deleteProduct(id: number) {
    if (confirm("Seguro que deseas eliminar este producto?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/products/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          await loadProducts(); // Reload products after deletion
        } else {
          errorMessage = "Failed to delete product";
        }
      } catch (error) {
        errorMessage = "Failed to delete product";
      }
    }
  }
</script>

<section class="products-container">
  <div class="products-header">
    <h1>moyecomponents.com</h1>
    <h2>
      {#if userRole === "admin"}
        Perfil de Aministrador
      {/if}
    </h2>
    <!-- <h2>Bienvenido, {userRole}!</h2> -->
    <!-- Cerrar sesion -->
  </div>

  {#if errorMessage}
    <p>{errorMessage}</p>
  {/if}

  {#if userRole === "admin"}
    <!-- Form para agregar productos -->
    <form class="add-product-form" on:submit|preventDefault={addProduct}>
      <div class="add-fields">
        <div>
          <label for="name">Nombre del componente:</label>
          <input type="text" id="name" bind:value={name} />
        </div>
        <div>
          <label for="description">Descripcion:</label>
          <input type="text" id="description" bind:value={description} />
        </div>
        <div>
          <label for="price">Precio:</label>
          <input type="number" id="price" bind:value={price} />
        </div>
        <div>
          <label for="image">Image URL:</label>
          <input type="text" id="image" bind:value={image} />
        </div>

        <!-- Mostrar la imagen si hay una URL válida -->
        {#if image}
          <div class="image-preview">
            <img src={image} alt="Vista previa de la imagen" />
          </div>
        {/if}

        <button type="submit">Añadir componente</button>
      </div>
    </form>
    <button class="logout-button" on:click={() => logout()}
      >Cerrar sesión</button
    >
  {/if}

  <!-- Lista de productos -->
  {#if products.length === 0}
    <p>No hay productos disponibles</p>
  {:else}
    <!-- TABLE -->
    <ul class="products-list">
      {#each products as product}
        <li class="product-item">
          {#if editingProductId === product.id}
            <div class="edit-fields">
              <input type="text" bind:value={editingName} placeholder="Name" />
              <input
                type="text"
                bind:value={editingDescription}
                placeholder="Description"
              />
              <input
                type="number"
                bind:value={editingPrice}
                placeholder="Price"
              />
              <input
                type="text"
                bind:value={editingImage}
                placeholder="Image URL"
              />
              <button on:click={saveProduct}>Save</button>
              <button on:click={() => (editingProductId = null)}>Cancel</button>
            </div>
          {:else}
            <div>
              <h2>{product.name}</h2>
              <p style="font-style: italic; font-size: 0.8rem;">
                {product.description}
              </p>
              <p>${product.price}</p>
              <img src={product.image} alt={product.name} width="100" />
              {#if userRole === "admin"}
                <!-- Admin CRUD buttons -->
                <div class="admin-buttons">
                  <button on:click={() => startEditProduct(product)}
                    >Edit</button
                  >
                  <button on:click={() => deleteProduct(product.id)}
                    >Delete</button
                  >
                </div>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .products-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
    padding: 20px;
    background-color: #f9f9fb;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .products-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
  }

  .products-header h1 {
    font-size: 3rem;
    color: #4a4e69;
    margin: 0;
    font-weight: bold;
    text-transform: uppercase;
  }

  .products-header h2 {
    font-size: 1.2rem;
    color: #2e86ab;
    font-style: italic;
    margin-top: 5px;
  }

  .add-product-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .add-fields {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .add-fields div {
    width: 100%;
  }

  .add-fields label {
    margin-right: 10px;
    font-size: 1rem;
    color: #4a4e69;
    font-weight: bold;
  }

  .add-fields input {
    padding: 10px;
    width: 100%;
    border: 2px solid #ccc;
    border-radius: 5px;
    transition: border-color 0.3s;
    font-size: 1rem;
  }

  .add-fields input:focus {
    outline: none;
    border-color: #2e86ab;
  }

  .add-fields button {
    margin-top: 20px;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background-color: #2e86ab;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    transition:
      background-color 0.3s,
      transform 0.3s;
  }

  .add-fields button:hover {
    background-color: #1b6f93;
    transform: scale(1.05);
  }

  .image-preview {
    margin-top: 20px;
    width: 100%;
    text-align: center;
  }

  .image-preview img {
    max-width: 300px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .products-list {
    display: grid; /* Usar grid para alinear las cartas */
    grid-template-columns: repeat(
      auto-fill,
      minmax(300px, 1fr)
    ); /* Las cartas se adaptan al espacio disponible */
    gap: 25px; /* Espacio entre cartas */
    list-style: none;
    padding: 0;
  }

  .product-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
  }

  .product-item:hover {
    transform: scale(1.03);
  }

  .product-item h2 {
    font-size: 1.8rem;
    color: #4a4e69;
    margin: 0;
  }

  .product-item p {
    margin: 10px 0;
    color: #575279;
  }

  .admin-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .admin-buttons button {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    background-color: #2e86ab;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition:
      background-color 0.3s,
      transform 0.3s;
  }

  .admin-buttons button:hover {
    background-color: #1b6f93;
    transform: scale(1.05);
  }

  .edit-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .edit-fields input {
    padding: 10px;
    border: 2px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  .edit-fields input:focus {
    outline: none;
    border-color: #2e86ab;
  }

  .edit-fields button {
    margin-top: 15px;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background-color: #2e86ab;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    transition:
      background-color 0.3s,
      transform 0.3s;
  }

  .edit-fields button:hover {
    background-color: #1b6f93;
    transform: scale(1.05);
  }
  .logout-button {
    padding: 10px 15px; /* Espaciado interno */
    border: none; /* Sin borde */
    border-radius: 5px; /* Bordes redondeados */
    background-color: #e74c3c; /* Color de fondo rojo */
    color: white; /* Color del texto */
    cursor: pointer; /* Cambiar el cursor al pasar sobre el botón */
    font-size: 1rem; /* Tamaño de fuente */
    transition:
      background-color 0.3s,
      transform 0.3s; /* Transiciones suaves */
    margin-top: 10px;
  }

  .logout-button:hover {
    background-color: #c0392b; /* Color de fondo más oscuro al pasar el cursor */
    transform: scale(1.05); /* Efecto de aumento al pasar el cursor */
  }

  .logout-button:focus {
    outline: none; /* Quitar el contorno al hacer clic */
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* Sombra al hacer clic */
  }
</style>
