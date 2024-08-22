<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let products: any[] = [];
  let userRole = '';
  let errorMessage = '';

  let name = '';
  let description = '';
  let price: number | null = null;
  let image = '';

  // Editar productos
  let editingProductId: number | null = null;
  let editingName = '';
  let editingDescription = '';
  let editingPrice: number | null = null;
  let editingImage = '';

  async function startEditProduct(product: any) {
    editingProductId = product.id;
    editingName = product.name;
    editingDescription = product.description;
    editingPrice = product.price;
    editingImage = product.image;
  }

  onMount(async () => {
    try {
      const userResponse = await fetch('http://localhost:3000/api/auth/check', {
        method: 'GET',
        credentials: 'include', // Enviar cookies
      });

      if (userResponse.ok) {
        console.log('User is logged in');
        const user = await userResponse.json();
        userRole = user.role;
        await loadProducts();
      } else {
        console.log('User is not logged in');
        goto('/login');
      }
    } catch (error) {
      console.error('Failed to check user authentication');
      goto('/login');
    }
  });

  // Cerrar la sesion
  function logout() {
    fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      goto('/login');
    });
  }

  async function loadProducts() {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      products = await response.json();
    } catch (error) {
      errorMessage = 'Failed to load products';
    }
  }

  // Funcion para agregar un producto
  async function addProduct() {
    if (!name || !description || price === null) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    try {
      // Enviar la peticion POST al servidor
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price, image }),
      });

      // Si la peticion fue exitosa, agregar el nuevo producto a la lista
      if (response.ok) {
        const newProduct = await response.json();
        products.push(newProduct);
        loadProducts(); // Reload products after adding
        name = '';
        description = '';
        price = null;
        image = '';
      } else {
        errorMessage = 'Failed to add product';
      }
    } catch (error) {
      errorMessage = 'Failed to add product';
    }
  }

  async function saveProduct() {
    if (editingProductId === null) return;

    try {
      const response = await fetch(`http://localhost:3000/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingName,
          description: editingDescription,
          price: editingPrice,
          image: editingImage,
        }),
      });

      if (response.ok) {
        await loadProducts(); // Reload products after update
        editingProductId = null; // Clear editing state
      } else {
        errorMessage = 'Failed to update product';
      }
    } catch (error) {
      errorMessage = 'Failed to update product';
    }
  }

  async function deleteProduct(id: number) {
    if (confirm('Seguro que deseas eliminar este producto?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadProducts(); // Reload products after deletion
        } else {
          errorMessage = 'Failed to delete product';
        }
      } catch (error) {
        errorMessage = 'Failed to delete product';
      }
    }
  }
</script>

<section class="products-container">
  <div class="products-header">
    <h1>Productos</h1>
    <h2>Bienvenido! {#if userRole === 'admin'} Eres un administrador {/if}</h2>
    <!-- <h2>Bienvenido, {userRole}!</h2> -->
    <!-- Cerrar sesion -->
    <button on:click={() => logout()}>Cerrar sesion</button>
  </div>

  {#if errorMessage}
    <p>{errorMessage}</p>
  {/if}

  {#if userRole === 'admin'}
    <!-- Form para agregar productos -->
    <form class="add-product-form" on:submit|preventDefault={addProduct}>
      <div class="add-fields">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" bind:value={name} />
        </div>
        <div>
          <label for="description">Description:</label>
          <input type="text" id="description" bind:value={description} />
        </div>
        <div>
          <label for="price">Price:</label>
          <input type="number" id="price" bind:value={price} />
        </div>
        <div>
          <label for="image">Image URL:</label>
          <input type="text" id="image" bind:value={image} />
        </div>
        <button type="submit">Add Product</button>
      </div>
    </form>
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
              <input type="text" bind:value={editingDescription} placeholder="Description" />
              <input type="number" bind:value={editingPrice} placeholder="Price" />
              <input type="text" bind:value={editingImage} placeholder="Image URL" />
              <button on:click={saveProduct}>Save</button>
              <button on:click={() => editingProductId = null}>Cancel</button>
            </div>
          {:else}
            <div>
              <h2>{product.name}</h2>
              <p style="font-style: italic; font-size: 0.8rem;">{product.description}</p>
              <p>${product.price}</p>
              <img src={product.image} alt={product.name} width="100" />
              {#if userRole === 'admin'}
                <!-- Admin CRUD buttons -->
                <div class="admin-buttons">
                  <button on:click={() => startEditProduct(product)}>Edit</button>
                  <button on:click={() => deleteProduct(product.id)}>Delete</button>
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
  }

  .products-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .products-header h1 {
    font-size: 2.5rem;
    color: #575279;
    margin: 0;
  }

  .products-header h2 {
    font-size: 1rem;
    color: #31748f;
  }

  .add-product-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .add-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;

    align-items: center;
  }

  .add-fields div {
    margin-bottom: 10px;
  }

  .add-fields label {
    margin-right: 10px;
  }

  .add-fields input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .add-fields input:focus {
    outline: none;
    border: 1px solid #31748f;
    transition: border 0.3s;
  }

  .add-fields button {
    margin-top: 10px;
    padding: 5px;
    border: none;
    border-radius: 5px;
    background-color: #31748f;
    color: white;
    cursor: pointer;
  }

  .add-fields button:hover {
    transform: scale(1.05);
    transition: transform 0.3s;
  }

  /* TABLE */
  .products-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    list-style: none;
    padding: 0;
  }

  .product-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .product-item h2 {
    font-size: 1.5rem;
    color: #575279;
    margin: 0;
  }

  .product-item p {
    margin: 0;
  }

  .admin-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .admin-buttons button {
    padding: 5px;
    border: none;
    border-radius: 5px;
    background-color: #31748f;
    color: white;
    cursor: pointer;
  }

  .admin-buttons button:hover {
    transform: scale(1.05);
    transition: transform 0.3s;
  }

  .edit-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .edit-fields input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .edit-fields input:focus {
    outline: none;
    border: 1px solid #31748f;
    transition: border 0.3s;
  }

  .edit-fields button {
    margin-top: 10px;
    padding: 5px;
    border: none;
    border-radius: 5px;
    background-color: #31748f;
    color: white;
    cursor: pointer;
  }

  .edit-fields button:hover {
    transform: scale(1.05);
    transition: transform 0.3s;
  }

</style>
