# KiFrames - Sistema de Carrito y Pagos Completo

Un sistema completo de e-commerce con carrito de compras y múltiples métodos de pago integrados (Stripe, PayPal, Mercado Pago).

## 🚀 Características

- **Carrito de Compras Completo**: Agregar, quitar, modificar cantidades
- **Múltiples Métodos de Pago**:
  - 💳 Stripe (Tarjetas de crédito/débito)
  - 💰 PayPal
  - 🇧🇷 Mercado Pago (PIX, tarjetas)
- **Backend Seguro**: Node.js/Express con validación y webhooks
- **Frontend Moderno**: HTML5, CSS3, JavaScript vanilla
- **Responsive Design**: Funciona en desktop y móvil
- **Gestión de Órdenes**: Tracking completo del estado de pedidos
- **Confirmaciones**: Emails automáticos y páginas de éxito

## 📁 Estructura del Proyecto

```
KiFrames/
├── Backend/
│   ├── server.js              # Servidor principal
│   ├── package.json           # Dependencias del backend
│   ├── env.example           # Variables de entorno
│   └── routes/
│       ├── payments.js        # Rutas de pagos
│       ├── orders.js          # Gestión de órdenes
│       └── webhooks.js        # Webhooks de pasarelas
├── Frontend/
│   ├── index.html            # Página principal
│   ├── cart.html             # Carrito de compras
│   ├── checkout.html         # Proceso de pago
│   ├── payment-success.html  # Página de éxito
│   ├── style.css             # Estilos principales
│   ├── cart.css              # Estilos del carrito
│   ├── checkout.css          # Estilos del checkout
│   ├── script.js             # JavaScript principal
│   ├── cart.js               # Lógica del carrito
│   └── checkout.js           # Lógica del checkout
└── README.md
```

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/kiframes.git
cd kiframes
```

### 2. Configurar el Backend

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp env.example .env
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=tu_client_id_paypal
PAYPAL_CLIENT_SECRET=tu_client_secret_paypal
PAYPAL_MODE=sandbox

# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_mercadopago
MERCADOPAGO_PUBLIC_KEY=tu_public_key_mercadopago

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Configuración de Pasarelas de Pago

### Stripe

1. Crear cuenta en [Stripe Dashboard](https://dashboard.stripe.com)
2. Obtener las claves API desde "Developers > API keys"
3. Configurar webhooks en "Developers > Webhooks":
   - URL: `https://tu-dominio.com/api/webhooks/stripe`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### PayPal

1. Crear cuenta en [PayPal Developer](https://developer.paypal.com)
2. Crear una aplicación en "My Apps & Credentials"
3. Obtener Client ID y Client Secret
4. Configurar webhooks:
   - URL: `https://tu-dominio.com/api/webhooks/paypal`
   - Eventos: `PAYMENT.SALE.COMPLETED`, `PAYMENT.SALE.DENIED`

### Mercado Pago

1. Crear cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Obtener Access Token y Public Key
3. Configurar webhooks:
   - URL: `https://tu-dominio.com/api/webhooks/mercadopago`
   - Eventos: `payment`

## 🌐 Uso del Frontend

### 1. Servir Archivos Estáticos

Para desarrollo local, puedes usar cualquier servidor HTTP:

```bash
# Con Python
python -m http.server 3000

# Con Node.js (http-server)
npx http-server -p 3000

# Con PHP
php -S localhost:3000
```

### 2. Configurar URLs del Backend

En los archivos JavaScript del frontend, asegúrate de que `API_BASE_URL` apunte a tu backend:

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 📱 Flujo de Usuario

1. **Navegación**: Usuario visita la página principal
2. **Selección**: Hace clic en "Add to Cart" en un producto
3. **Carrito**: Revisa productos en `cart.html`
4. **Checkout**: Procede al pago en `checkout.html`
5. **Pago**: Selecciona método de pago y completa la transacción
6. **Confirmación**: Ve la página de éxito con detalles del pedido

## 🔒 Seguridad

- **Validación**: Todos los datos se validan en frontend y backend
- **Sanitización**: Inputs sanitizados para prevenir XSS
- **Rate Limiting**: Límites de requests para prevenir abuso
- **CORS**: Configurado para dominios específicos
- **Webhooks**: Verificación de firmas para autenticidad

## 🧪 Testing

### Tarjetas de Prueba (Stripe)

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005
Declined: 4000 0000 0000 0002
```

### PayPal Sandbox

Usa las credenciales de sandbox para testing.

### Mercado Pago

Usa el entorno de testing con las credenciales correspondientes.

## 📊 API Endpoints

### Pagos

- `GET /api/payments/config` - Configuración de métodos de pago
- `POST /api/payments/stripe/create-intent` - Crear intención de pago Stripe
- `POST /api/payments/paypal/create` - Crear pago PayPal
- `POST /api/payments/mercadopago/create` - Crear pago Mercado Pago

### Órdenes

- `POST /api/orders/create` - Crear nueva orden
- `GET /api/orders/:orderId` - Obtener orden por ID
- `PATCH /api/orders/:orderId/status` - Actualizar estado de orden

### Webhooks

- `POST /api/webhooks/stripe` - Webhook de Stripe
- `POST /api/webhooks/paypal` - Webhook de PayPal
- `POST /api/webhooks/mercadopago` - Webhook de Mercado Pago

## 🚀 Despliegue

### Backend (Heroku/Railway/DigitalOcean)

1. Configurar variables de entorno en la plataforma
2. Actualizar `FRONTEND_URL` con tu dominio
3. Configurar webhooks con las URLs de producción

### Frontend (Netlify/Vercel/GitHub Pages)

1. Actualizar `API_BASE_URL` en los archivos JS
2. Configurar redirects si es necesario
3. Habilitar HTTPS

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: support@kiframes.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/kiframes/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/kiframes/wiki)

## 🔄 Changelog

### v1.0.0
- ✅ Sistema de carrito completo
- ✅ Integración con Stripe, PayPal y Mercado Pago
- ✅ Gestión de órdenes
- ✅ Webhooks para confirmaciones
- ✅ UI responsive y moderna

---

**¡Gracias por usar KiFrames! 🎬✨** 