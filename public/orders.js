document.addEventListener("DOMContentLoaded", renderOrderPage);

function renderOrderPage() {
  const orderDiv = document.getElementById("orderDiv");
  orderDiv.innerHTML = "";
  axios.get("http://18.182.55.213:3000/orders").then((response) => {
    response.data.orders.reverse().forEach((order) => {
      const orderBox = document.createElement("div");
      orderBox.style = "align-items:center";
      orderBox.innerHTML = `<br><h3>Order ID : ${order.id}</h3>`;

      order.products.forEach((product) => {
        const productsBox = document.createElement("div");
        productsBox.innerHTML = `
                <span> <h4>${product.title}</h4> </span> 
                <span style="margin-right:50px">Price :$${product.price} </span> 
                <span> Quantity: ${product.orderItem.quantity} </span>
                <br>
                `;
        orderBox.appendChild(productsBox);
      });

      orderDiv.appendChild(orderBox);
      orderDiv.appendChild(document.createTextNode(`Amount: ${order.amount}`));
    });
  });
}
