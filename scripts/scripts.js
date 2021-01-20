window.onload = () => {
  var resetPwBtn = document.getElementById('resetPw-button');
  var forgotPwBtn = document.getElementById('forgotPw-button');

  if(resetPwBtn)
    resetPwBtn.addEventListener("click", pwValidateSubmit);
  if(forgotPwBtn)
    forgotPwBtn.addEventListener("click", emailValidateSubmit);
}


function pwValidateSubmit() {
  var password = document.getElementsByName("password")[0].value;
  var confirmPassword = document.getElementsByName("repeatPassword")[0].value;
  if (password != confirmPassword) {
    return document.getElementById('message').innerHTML = "Error: Las contraseñas no coinciden."
  }
  return document.getElementsByName("changePwForm")[0].submit();
}

function emailValidateSubmit() {
  var email = document.getElementsByName("email")[0].value;
  if ( /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email) ) {
    document.getElementById('message').innerHTML = "Se ha enviado un correo electrónico con las instrucciones."
    return document.getElementsByName("forgotPwForm")[0].submit();
    console.log('submitted and valid');
  }
  console.log('invalid');
  return document.getElementById('message').innerHTML = "Error: El email ingresado no es válido."
}
