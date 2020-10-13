var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var paymentType

function paymentOption(type) {
  console.log(type)
  paymentType = type
  if (type === 'bancaire') { // Carte Bancaire channel
    Frames.init({
      publicKey: "pk_test_567fa5f9-6f79-45ca-a53e-b2e7b83936a8"
    });
  } else {
    Frames.init({ // Default channel
      publicKey: "pk_test_7d9921be-b71f-47fa-b996-29515831d911"
    });
  }
  form.classList.remove("hide")
}

Frames.addEventHandler(
  Frames.Events.CARD_VALIDATION_CHANGED,
  onCardValidationChanged
);
function onCardValidationChanged(event) {
  console.log("CARD_VALIDATION_CHANGED: %o", event);

  var errorMessage = document.querySelector(".error-message");
  payButton.disabled = !Frames.isCardValid();
}

Frames.addEventHandler(
  Frames.Events.FRAME_VALIDATION_CHANGED,
  onValidationChanged
);
function onValidationChanged(event) {
  console.log("FRAME_VALIDATION_CHANGED: %o", event);

  var errorMessage = document.querySelector(".error-message");
  errorMessage.textContent = getErrorMessage(event);
}

var errors = {};
errors["card-number"] = "Please enter a valid card number";
errors["expiry-date"] = "Please enter a valid expiry date";
errors["cvv"] = "Please enter a valid cvv code";

function getErrorMessage(event) {
  if (event.isValid || event.isEmpty) {
    return "";
  }

  return errors[event.element];
}

Frames.addEventHandler(
  Frames.Events.CARD_TOKENIZATION_FAILED,
  onCardTokenizationFailed
);
function onCardTokenizationFailed(error) {
  console.log("CARD_TOKENIZATION_FAILED: %o", error);
  Frames.enableSubmitForm();
}

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);
function onCardTokenized(event) {
  var el = document.querySelector(".success-payment-message");
  el.innerHTML =
    "Card tokenization completed<br>" +
    'Your card token is: <span class="token">' +
    event.token +
    "</span>";
  sendToPost(event.token);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  Frames.submitCard();
});

function sendToPost(token) {
  $.post("server/payment.php",
    {
      cko_card_token: token,
      payment_type: paymentType
    },
    function (data, status) {
      console.log(data);
    });
}