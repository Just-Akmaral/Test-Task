var MyForm = {};

MyForm.validate =  function() {
	let result = {
		isValid: true,
    errorFields: []
	};
	let data = MyForm.getData();

	// check fio
	const fioWordsCount = 3;
	const lettersPattern = (/(^([A-Za-z]+\s[A-Za-z]+\s[A-za-z]+)*$)|(^([А-Яа-я]+\s[А-Яа-я]+\s[А-Яа-я])*$)/);

	let isLetterFio = lettersPattern.test(data.fio);
  let isValidFio = ((isLetterFio) && (data.fio.trim().split(" ").length === fioWordsCount)) ? true : false;

	//check phone
  const allowedPhoneSum = 30;
  const phonePattern = (/^(\+7)(\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$)/g);
	let isPhone = phonePattern.test(data.phone);
	let phoneSum = data.phone.replace(/\D/g, "")
													 .split("")
													 .map((dig) => dig * 1)
													 .reduce((sum, cur) => sum + cur, 0);
	let isValidPhone = ((!isPhone) || (phoneSum > allowedPhoneSum))? false: true;

	//check email
  const emailPattern = (/^(([^<>()\[\]\\.,;:\s@"']+(\.[^<>()\[\]\\.,;:\s@"']+)*)|(".+"))@(ya.ru)|(yandex.ru)|(yandex.ua)|(yandex.by)|(yandex.kz)|(yandex.com)$/gi);
	let isValidEmail = emailPattern.test(data.email);

	//set error fields
	if (!isValidFio) {
        result.errorFields.push("fio");
    }
    if(!isValidPhone) {
        result.errorFields.push("phone");
    }
    if (!isValidEmail) {
        result.errorFields.push("email");
    }

		//check validation
    result.isValid = (result.errorFields.length !== 0) ? false: true;
    return result;
};

MyForm.getData = function() {
    return {
    		fio: document.forms["MyForm"]["fio"].value,
        email: document.forms["MyForm"]["email"].value,
        phone: document.forms["MyForm"]["phone"].value,
	};
};

MyForm.setData = function(data) {
	 let fields = Object.keys(data).filter((name) => ["fio", "phone", "email"].indexOf(name) !== -1); //ignore wrong fields
	 fields.forEach((name) => document.forms["MyForm"][name].value = data[name]);
};

MyForm.submit = function() {
	const resultContainer = document.getElementById("resultContainer");
	const submitButton = document.getElementById("submitButton");
	let validateResult = MyForm.validate();
	let form = document.forms["MyForm"];

	//clear prev results
	resultContainer.innerHTML = "";
	for(var i = 0; i < form.elements.length; i++){
		form.elements[i].classList.remove("error");
	}
	let clearClass = function (container) {
		container.classList.remove("success");
		container.classList.remove("progress");
		container.classList.remove("error");
	};

	//work with req and resp
	var getRandomUrl = function () {
		let urls = ["./json/success.json", "./json/progress.json", "./json/error.json"];
		let num = Math.floor(Math.random() * 3);
		return urls[num];
	}

	 let setResponse = (response) => {
			 switch (response.status) {
					 case 'success':
					 		 clearClass(resultContainer);
							 resultContainer.innerHTML = "Success";
							 resultContainer.classList.add("success");
							 break;
					 case 'progress':
					 		 clearClass(resultContainer);
					 		 resultContainer.innerHTML = "";
					 		 resultContainer.classList.add("progress");
							 setTimeout(sendRequest, parseFloat(response.timeout));
							 break;
					 case 'error':
					 		 clearClass(resultContainer);
					 		 resultContainer.innerHTML = response.reason;
					 		 resultContainer.classList.add("error");
							 break;
			 }
	 };

	let sendRequest = () => {
		let randomUrl = getRandomUrl();
		let user_data = MyForm.getData();
		$.ajax({
			type: "POST",
		  url: randomUrl,
		  data: user_data,
		  dataType: "json",
		  success: function(data){
		  	setResponse(data);
		  },
			error: () => {
				setResponse({status: "error", reason: "ajax error"});
			}
		 });
	}

	//disable button and send request
	if (validateResult.isValid) {
  		submitButton.disabled = true;
			sendRequest();
	} else {
		validateResult.errorFields.forEach((field) => {
			form[field].classList.add("error"); // mark error fields
		});
	}
	return false;
};
