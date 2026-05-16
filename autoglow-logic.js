const state = {
  service: null, price: null, username: null,
  mobile: null, carType: null, date: null,
  time: null, payment: null, vat: null, total: null
};

const subtitles = {
  home:         'Book your shine in seconds',
  about:        'Who we are',
  help:         "We're here to help",
  login:        'Login to continue',
  signup:       'Create your account',
  booking:      'Choose your details',
  checkout:     'Review and confirm',
  confirmation: 'Booking confirmed'
};

const navPages = ['home', 'about', 'help'];

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-' + name).classList.remove('hidden');
  document.getElementById('headerSub').textContent = subtitles[name] || '';
  window.scrollTo(0, 0);

  navPages.forEach(p => {
    const el = document.getElementById('nav-' + p);
    if (el) el.classList.toggle('active', p === name);
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(id) {
  document.getElementById(id).classList.add('hidden');
}

// ── HOME ──
function selectService(name, price) {
  state.service = name;
  state.price   = price;
  showPage('login');
}

// ── LOGIN ──
function doLogin() {
  const mobile = document.getElementById('loginMobile').value.trim();
  const pass   = document.getElementById('loginPass').value;

  if (!/^05\d{8}$/.test(mobile) || !pass)
    return showError('loginError', 'Please enter a valid mobile number and password.');

  const users = JSON.parse(localStorage.getItem('ag_users') || '[]');
  const user  = users.find(u => u.mobile === mobile && u.password === pass);

  if (!user)
    return showError('loginError', 'Incorrect mobile number or password.');

  state.username = user.username;
  state.mobile   = mobile;
  hideError('loginError');
  goToBooking();
}

// ── SIGNUP ──
function doSignup() {
  const name    = document.getElementById('signupName').value.trim();
  const mobile  = document.getElementById('signupMobile').value.trim();
  const pass    = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (!name)                      return showError('signupError', 'Please enter your name.');
  if (!/^05\d{8}$/.test(mobile)) return showError('signupError', 'Enter a valid mobile number (05xxxxxxxx).');
  if (pass.length < 6)            return showError('signupError', 'Password must be at least 6 characters.');
  if (pass !== confirm)           return showError('signupError', 'Passwords do not match.');

  const users = JSON.parse(localStorage.getItem('ag_users') || '[]');
  if (users.find(u => u.mobile === mobile))
    return showError('signupError', 'This mobile number is already registered.');

  users.push({ username: name, mobile, password: pass });
  localStorage.setItem('ag_users', JSON.stringify(users));

  state.username = name;
  state.mobile   = mobile;
  hideError('signupError');
  goToBooking();
}

// ── BOOKING ──
function goToBooking() {
  document.getElementById('bookingService').textContent = state.service;
  document.getElementById('bookingUser').textContent    = state.username || state.mobile;
  document.getElementById('bookDate').min = new Date().toISOString().split('T')[0];
  showPage('booking');
}

function doBooking() {
  const car  = document.querySelector('input[name="car"]:checked');
  const date = document.getElementById('bookDate').value;
  const time = document.querySelector('input[name="time"]:checked');

  if (!car || !date || !time)
    return showError('bookingError', 'Please complete all booking details.');

  state.carType = car.value;
  state.date    = date;
  state.time    = time.value;
  hideError('bookingError');
  goToCheckout();
}

// ── CHECKOUT ──
function goToCheckout() {
  state.vat   = state.price * 0.15;
  state.total = state.price + state.vat;

  document.getElementById('checkoutSummary').innerHTML =
    row('Service',   state.service)                    +
    row('Car Type',  state.carType)                    +
    row('Date',      state.date)                       +
    row('Time',      state.time)                       +
    row('Price',     state.price.toFixed(2) + ' SAR') +
    row('VAT (15%)', state.vat.toFixed(2)   + ' SAR') +
    row('Total',     state.total.toFixed(2) + ' SAR');

  showPage('checkout');
}

function doCheckout() {
  const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const expiry  = document.getElementById('cardExpiry').value.trim();
  const cvv     = document.getElementById('cardCVV').value.trim();

  if (!/^\d{16}$/.test(cardNum))
    return showError('checkoutError', 'Please enter a valid 16-digit card number.');
  if (!/^\d{2}\/\d{2}$/.test(expiry))
    return showError('checkoutError', 'Please enter expiry date as MM/YY.');
  if (!/^\d{3}$/.test(cvv))
    return showError('checkoutError', 'Please enter a valid 3-digit CVV.');

  state.payment = 'Credit Card';
  hideError('checkoutError');
  goToConfirmation();
}

// ── CONFIRMATION ──
function goToConfirmation() {
  const ref = 'AG' + Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('confRef').textContent = ref;

  document.getElementById('confSummary').innerHTML =
    row('Name',    state.username || 'Guest')          +
    row('Mobile',  state.mobile)                       +
    row('Service', state.service)                      +
    row('Car',     state.carType)                      +
    row('Date',    state.date)                         +
    row('Time',    state.time)                         +
    row('Payment', state.payment)                      +
    row('Total',   state.total.toFixed(2) + ' SAR');

  showPage('confirmation');
}

function goHome() {
  Object.keys(state).forEach(k => state[k] = null);
  showPage('home');
}

// ── HELPER ──
function row(label, value) {
  return `<div class="summary-row"><span>${label}</span><span>${value}</span></div>`;
}

// ── ENTER KEY ──
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const id = document.querySelector('.page:not(.hidden)').id;
  if (id === 'page-login')   doLogin();
  if (id === 'page-signup')  doSignup();
  if (id === 'page-booking') doBooking();
});

// ── CARD FORMATTING ──
document.getElementById('cardNumber').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').substring(0, 16);
  this.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
});

document.getElementById('cardExpiry').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').substring(0, 4);
  if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
  this.value = v;
});
