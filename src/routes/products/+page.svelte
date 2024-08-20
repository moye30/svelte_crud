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

  // TODO: Conseguir al usuario almacenado en sessionStorage
  onMount(async () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.username) {
      goto('/login');
    } else {
      userRole = user.role;
      await loadProducts();
    }
  });

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

  async function editProduct(id: number) {
    const newName = prompt('Enter new product name:');
    const newDescription = prompt('Enter new product description:');
    const newPrice = parseFloat(prompt('Enter new product price:') || '0');

    if (newName && newDescription && !isNaN(newPrice)) {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newName,
            description: newDescription,
            price: newPrice,
          }),
        });

        if (response.ok) {
          await loadProducts(); // Reload products after update
        } else {
          errorMessage = 'Failed to update product';
        }
      } catch (error) {
        errorMessage = 'Failed to update product';
      }
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
    <h2>Bienvenido, {userRole}!</h2>
    <!-- Cerrar sesion -->
    <button on:click={() => {
      sessionStorage.removeItem('user');
      goto('/login');
    }}>Cerrar sesion</button>
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
          <h2>{product.name}</h2>
          <p style="font-style: italic; font-size: 0.8rem;">{product.description}</p>
          <p>${product.price}</p>
          
          {#if userRole === 'admin'}
            <!-- Admin CRUD buttons -->
            <div class="admin-buttons">
              <button on:click={() => editProduct(product.id)}>Edit</button>
              <button on:click={() => deleteProduct(product.id)}>Delete</button>
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

</style>
