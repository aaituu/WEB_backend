fetch("/data")
  .then((res) => res.json())
  .then((data) => {
    const bmiTarget = data.weight / (data.height / 100) ** 2;
    const bmiElem = document.getElementById("bmiValue");
    const txtResult = document.getElementById("txt-about-result");
    let current = 0;
    const speed = 5;
    const step = bmiTarget / 100;

    const interval = setInterval(() => {
      current += step;
      if (current >= bmiTarget) {
        current = bmiTarget;
        clearInterval(interval);

        highlightRow(bmiTarget);

        if (bmiTarget < 18.5) {
          txtResult.textContent = "Underweight";
        } else if (bmiTarget < 25) {
          txtResult.textContent = "Healthy";
        } else if (bmiTarget < 30) {
          txtResult.textContent = "Overweight";
        } else {
          txtResult.textContent = "Obesity";
        }
        txtResult.classList.add("show");
      }

      bmiElem.textContent = current.toFixed(1);

      if (current < 18.5) {
        bmiElem.style.color = "#3498db";
      } else if (current < 25) {
        bmiElem.style.color = "#2ecc71";
      } else if (current < 30) {
        bmiElem.style.color = "#f1c40f";
      } else {
        bmiElem.style.color = "#e74c3c";
      }
    }, speed);

    function highlightRow(bmi) {
      document.querySelectorAll(".range table tr").forEach((tr) => {
        tr.classList.remove(
          "active-under",
          "active-healthy",
          "active-over",
          "active-obese"
        );
      });

      if (bmi < 18.5) {
        txtResult.textContent = "Underweight";
        document.getElementById("row-under").classList.add("active-under");
      } else if (bmi < 25) {
        txtResult.textContent = "Healthy";
        document.getElementById("row-healthy").classList.add("active-healthy");
      } else if (bmi < 30) {
        txtResult.textContent = "Overweight";
        document.getElementById("row-over").classList.add("active-over");
      } else {
        txtResult.textContent = "Obesity";
        document.getElementById("row-obese").classList.add("active-obese");
      }
    }
  })
  .catch((err) => console.error("Ошибка загрузки данных:", err));
