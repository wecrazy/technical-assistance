// Wait for the document to be ready
$(document).ready(function () {
  // login
  function checkLoginFields() {
    var email = $("#email").val();
    var password = $("#password").val();
    var captcha = $("#captcha").val();

    // Enable or disable sign-in button based on conditions
    if (
      email.trim() !== "" &&
      password.trim() !== "" &&
      captcha.trim() !== ""
    ) {
      $("#signInBtn").prop("disabled", false);
    } else {
      $("#signInBtn").prop("disabled", true);
    }
    if (email.trim() !== "") {
      $("#email").removeClass("glowing-border");
    } else {
      $("#email").addClass("glowing-border");
    }
    if (password.trim() !== "") {
      $("#password-container").removeClass("glowing-border");
    } else {
      $("#password-container").addClass("glowing-border");
    }
    if (captcha.trim() !== "") {
      $("#captcha").removeClass("glowing-border");
    } else {
      $("#captcha").addClass("glowing-border");
    }
  }
  // Attach keyup event listener to input fields
  $("#email, #password, #captcha").keyup(function () {
    checkLoginFields(this);
  });

  let $captcha = $("#captcha");

  $captcha.on("input", function (event) {
    if ($captcha.val().length > 6) {
      $captcha.val($captcha.val().slice(0, 6)); // Trim to 6 characters
      return;
    }

    if ($captcha.val()) {
      // Check if captcha value exists
      console.log($captcha.val());
      var epochTime = Date.now();
      timeEvents.push(epochTime);
      captchaEvents.push($captcha.val());
    } else {
      timeEvents = [];
      captchaEvents = [];
    }
  });

  // $("#loading-container").hide();
  // Attach a submit event handler to the form
  $("#formLoginAuthentication").submit(function (e) {
    e.preventDefault();

    var formData = {
      "email-username": $("#email").val(),
      password: $("#password").val(),
      "remember-me": $("#remember-me").is(":checked"),
      captcha: $("#captcha").val(),
      "time-event": JSON.stringify(timeEvents),
      "captcha-event": JSON.stringify(captchaEvents),
    };

    // $.ajax({
    //   type: 'POST',
    //   url: '/login',
    //   data: formData,
    //   success: function (response) {
    //     console.log(response);
    //     window.location.reload();
    //   },
    //   error: function (error) {
    //     refreshCaptcha();
    //     if (error.responseJSON.msg != undefined) {
    //       let minutes = error.responseJSON.minutes;
    //       let seconds = error.responseJSON.seconds;
    //       let email = error.responseJSON.email;

    //       // Display SweetAlert with the message and email
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Login Failed',
    //         html: `Login for <strong>${email}</strong> is banned for ${minutes}:${seconds}`,
    //         confirmButtonText: 'OK'
    //       });

    //       // Set the email in the countdown display
    //       // $('#user_email').text(email);

    //       // Call the function to start the countdown
    //       startCountdown(minutes, seconds, email);
    //     } else {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: error.responseJSON.error,
    //         confirmButtonText: 'OK'
    //       });
    //     }
    //   }
    // });
    $.ajax({
      type: "POST",
      url: "/login",
      data: formData,
      success: function (response) {
        console.log(response);
        window.location.reload();
      },
      error: function (error) {
        // refreshCaptcha(); // uncomment this soon !!

        if (error.responseJSON) {
          if (error.responseJSON.msg) {
            let minutes = error.responseJSON.minutes || 0;
            let seconds = error.responseJSON.seconds || 0;
            let email = error.responseJSON.email || "Unknown";

            Swal.fire({
              icon: "error",
              title: "Login Failed",
              html: `Login for <strong>${email}</strong> is banned for ${minutes}:${seconds}`,
              confirmButtonText: "OK",
            });

            startCountdown(minutes, seconds, email);
          } else if (error.responseJSON.error) {
            // Handle Gin's error response
            Swal.fire({
              icon: "error",
              title: "Error",
              text: error.responseJSON.error,
              confirmButtonText: "OK",
            });
          } else {
            // Default error message if no expected keys exist
            Swal.fire({
              icon: "error",
              title: "Unexpected Error",
              text: "An unknown error occurred. Please try again.",
              confirmButtonText: "OK",
            });
          }
        } else {
          // Handle cases where error.responseJSON is undefined
          Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "No response from the server. Please check your connection.",
            confirmButtonText: "OK",
          });
        }
      },
    });

    function startCountdown(minutes, seconds, email) {
      // Update the timer immediately
      updateTimer(minutes, seconds, email);

      // Set interval to update the countdown every second
      let countdown = setInterval(function () {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(countdown); // Stop the countdown if time runs out
            Swal.fire({
              icon: "success",
              title: "Time Up",
              text: `You can now try logging in again for ${email}.`,
              confirmButtonText: "OK",
            });
            $("#delay_timer").text(``);
          } else {
            minutes--; // Decrement minutes and reset seconds to 59
            seconds = 59;
          }
        } else {
          seconds--; // Decrement seconds
        }

        // Update the timer text in the DOM
        updateTimer(minutes, seconds, email);
      }, 1000);
    }

    // Function to update the timer element in the DOM
    function updateTimer(minutes, seconds, email) {
      // Add leading zero to seconds if necessary
      let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
      $("#delay_timer").text(
        `Login for ${email} is banned for ${minutes}:${formattedSeconds}`
      );
    }
  });
  function loadAndShowTab(targetTabId) {
    if (targetTabId.substring(1) == "debug") {
      $("#loading-container").removeClass("d-block").addClass("d-none");
      $("#loading-container").hide();
      $("body").removeClass("loading_background");
      $("#debug-container").removeClass("d-none").addClass("d-block");
      return;
    }
    if (targetTabId.indexOf("#") >= 0) {
      // console.log(targetTabId);
      if ($(targetTabId).children().length > 0) {
        // $(targetTabId).show();
        $(targetTabId).removeClass("d-none").addClass("d-block");
      } else {
        var isTabValid =
          $(".menu-link:not(.menu-toggle)").filter(function () {
            return $(this).attr("href") === targetTabId;
          }).length > 0;
        if (isTabValid) {
          fetch(webPath + "components/" + targetTabId.substring(1))
            .then((response) => {
              if (response.status != 200) {
                // window.location.reload();
              }
              return response.text();
            })
            .then((html) => {
              if (html.includes("</html>")) {
                // window.location.reload();
                return;
              }
              $("#loading-container").hide();
              $("body").removeClass("loading_background");

              $(targetTabId).html(html);
              // $(targetTabId).show();
              $(targetTabId).removeClass("d-none").addClass("d-block");
              if (html == "" || html == null) {
                // $("#error-container").show();
                $("#error-container").removeClass("d-none").addClass("d-block");
              }
              var targetAnchor = $(
                'a[href="' + targetTabId + '"].menu-link:not(.menu-toggle)'
              );
              targetAnchor.addClass("active");
              // Remove 'active' class from all menu items within the same menu-sub
              targetAnchor
                .closest(".menu-inner")
                .find(".menu-item")
                .removeClass("active");

              // Add 'active' class to the clicked menu item
              targetAnchor.closest(".menu-item").addClass("active");

              // Set parent menu-item with 'active' class
              targetAnchor
                .closest(".menu-item")
                .parents(".menu-item")
                .addClass("active");
            })
            .catch((error) => {
              console.log("Error fetching content:", error);
              $("#loading-container").removeClass("d-block").addClass("d-none");
              $("body").removeClass("loading_background");
              $("#error-container").removeClass("d-none").addClass("d-block");
            });
        } else {
          $("#loading-container").removeClass("d-block").addClass("d-none");
          $("#error-container").removeClass("d-none").addClass("d-block");
          $("body").removeClass("loading_background");
        }
      }
    } else {
      // Handle the case where targetTabId does not contain #
      console.log("Invalid targetTabId:", targetTabId);
    }
  }
  if (window.location.pathname.indexOf("/page") !== -1) {
    var targetTabId = window.location.hash;

    if (targetTabId == null || targetTabId == "") {
      targetTabId = $(".menu-link:not(.menu-toggle):first").attr("href");
    }
    loadAndShowTab(targetTabId);

    // Handle tab clicks
    $(".menu-link:not(.menu-toggle)").click(function (e) {
      $(".tab-content").removeClass("d-block").addClass("d-none");
      $("#error-container").removeClass("d-block").addClass("d-none");

      // Get the target tab ID from the href attribute
      var targetTabId = $(this).attr("href");
      loadAndShowTab(targetTabId);

      // Remove 'active' class from all menu items within the same menu-sub
      $(this).closest(".menu-inner").find(".menu-item").removeClass("active");

      // Add 'active' class to the clicked menu item
      $(this).closest(".menu-item").addClass("active");

      // Set parent menu-item with 'active' class
      $(this).closest(".menu-item").parents(".menu-item").addClass("active");
    });
  }

  // For Avatar badge
  var stateNum = Math.floor(Math.random() * 6);
  var states = [
    "success",
    "danger",
    "warning",
    "info",
    "dark",
    "primary",
    "secondary",
  ];
  var state = states[stateNum];

  //in
  var name = $("#user-admin-name").html(),
    initials = name.match(/\b\w/g) || [];

  if (
    $(".mainAvatar > img").attr("src") == "/assets/img/avatars/default.jpg" ||
    $(".mainAvatar > img").attr("src") == ""
  ) {
    initials = (
      (initials.shift() || "") + (initials.pop() || "")
    ).toUpperCase();
    output = `<span class="avatar-initial rounded-circle bg-label-${state}">${initials}</span>`;
    $(".mainAvatar").html(output);
  }
});
document.querySelectorAll(".horizontal-scrollbar").forEach((element) => {
  new PerfectScrollbar(element, {
    wheelPropagation: false,
    suppressScrollY: true,
  });
});
function jsonToHtml(jsonData) {
  var container = document.getElementById("mainCourseContent");

  function createHtmlElement(tag, attributes, content) {
    var element = document.createElement(tag);

    // Set attributes
    for (var key in attributes) {
      if (key === "tag" || key === "child") {
        continue;
      }
      if (attributes.hasOwnProperty(key)) {
        element.setAttribute(key, attributes[key]);
      }
    }

    // Set content
    if (content instanceof Array) {
      content.forEach(function (child) {
        var childElement = createHtmlElement(child.tag, child, child.child);
        element.appendChild(childElement);
      });
    } else if (typeof content === "string") {
      const parser = new DOMParser();
      try {
        const doc = parser.parseFromString(content, "text/html");
        if (
          Array.from(doc.body.childNodes).some((node) => node.nodeType === 1)
        ) {
          element.innerHTML += content;
        } else {
          element.appendChild(document.createTextNode(content));
        }
      } catch (error) {
        element.appendChild(document.createTextNode(content));
      }
    }

    return element;
  }

  var path = window.location.pathname;

  // Extract the relevant parts from the path
  var parts = path.split("/").filter((part) => part !== "");

  // Convert the parts into the desired format
  var stringId = parts
    .map((part, index) => {
      if (index % 2 === 0) {
        // Even indices are section names (e.g., "courses", "modules", "contents")
        return part.substring(0, 2);
      } else {
        // Odd indices are section IDs (e.g., "1", "1", "3")
        return `-${part}-`;
      }
    })
    .join("");

  var i = 0;
  jsonData.forEach(function (item) {
    if (document.getElementById("userLevel").value === "true") {
      const viewBtn = document.getElementById("viewBtn");
      viewBtn.classList.remove("d-none");
      viewBtn.classList.add("d-flex");

      var validId = stringId + i;

      // Create a container div to wrap the buttons
      var buttonContainer = document.createElement("div");

      // Create the edit button
      var editButton = document.createElement("button");
      editButton.id = "change-" + validId;
      editButton.className = "btn text-primary edit-btn px-1";
      editButton.innerHTML = 'Edit <i class="bx bx-edit"></i>';
      editButton.addEventListener("click", function () {
        editContents(validId);
      });

      // Create the delete button
      var deleteButton = document.createElement("button");
      deleteButton.id = "delete-" + validId;
      deleteButton.className = "btn text-danger edit-btn  px-1";
      deleteButton.innerHTML = '<i class="bx bx-trash" ></i>';
      deleteButton.addEventListener("click", function () {
        deleteContents(validId);
      });

      // Append both buttons to the container div
      buttonContainer.className = "align-self-end d-flex flex-row";
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      // Append the container div to your main container
      container.appendChild(buttonContainer);
    }

    var element = createHtmlElement(item.tag, item, item.child);
    element.id = validId;
    container.appendChild(element);
    i++;
  });

  //Content Button
  var newContentButton = document.createElement("a");
  newContentButton.className =
    "btn d-flex flex-column align-items-center justify-content-center text-primary";
  newContentButton.innerHTML =
    '<i class="bx bx-plus-circle bx-lg"></i>Sub Content';
  newContentButton.addEventListener("click", function () {
    i++;
    var contentID = stringId + i;

    if (document.getElementById("userLevel").value === "true") {
      // Create a container div to wrap the buttons
      var buttonContainer = document.createElement("div");

      // Create the edit button
      var editButton = document.createElement("button");
      editButton.id = "change-" + contentID;
      editButton.className = "btn text-primary edit-btn px-1";
      editButton.innerHTML = 'Save <i class="bx bx-save"></i>';
      editButton.addEventListener("click", function () {
        editContents(contentID);
      });

      // Create the delete button
      var deleteButton = document.createElement("button");
      deleteButton.id = "delete-" + contentID;
      deleteButton.className = "btn text-danger edit-btn  px-1";
      deleteButton.innerHTML = '<i class="bx bx-trash" ></i>';
      deleteButton.addEventListener("click", function () {
        var elementToRemove = document.getElementById(contentID); // Replace with your actual element ID

        if (elementToRemove) {
          var siblingsToRemove = [
            elementToRemove.previousElementSibling,
            elementToRemove.previousElementSibling.previousElementSibling,
          ];

          // Remove the element and its two above siblings
          elementToRemove.remove();
          siblingsToRemove.forEach(function (sibling) {
            if (sibling) {
              sibling.remove();
            }
          });
        }
      });

      // Append both buttons to the container div
      buttonContainer.className = "align-self-end d-flex flex-row";
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      // Append the container div to your main container
      container.appendChild(buttonContainer);

      //create New div
      var div = document.createElement("div");
      div.id = contentID;
      container.appendChild(div);
    }
    const fullToolbar = [
      [
        {
          font: [],
        },
        {
          size: [],
        },
      ],
      ["bold", "italic", "underline", "strike"],
      [
        {
          color: [],
        },
        {
          background: [],
        },
      ],
      [
        {
          script: "super",
        },
        {
          script: "sub",
        },
      ],
      [
        {
          header: "1",
        },
        {
          header: "2",
        },
        "blockquote",
        "code-block",
      ],
      [
        {
          list: "ordered",
        },
        {
          list: "bullet",
        },
        {
          indent: "-1",
        },
        {
          indent: "+1",
        },
      ],
      [{ direction: "rtl" }],
      ["link", "image", "video", "formula"],
      ["clean"],
    ];
    const fullEditor = new Quill("#" + contentID, {
      bounds: "#" + contentID,
      placeholder: "Type Something...",
      modules: {
        formula: true,
        toolbar: fullToolbar,
      },
      theme: "snow",
    });
  });
  var newVideoButton = document.createElement("a");
  newVideoButton.className =
    "btn d-flex flex-column align-items-center justify-content-center text-primary";
  newVideoButton.innerHTML = '<i class="bx bx-video-plus bx-lg"></i>Video';
  newVideoButton.addEventListener("click", function () {
    i++;
    var contentID = stringId + i;

    if (document.getElementById("userLevel").value === "true") {
      // Create a container div to wrap the buttons
      var buttonContainer = document.createElement("div");

      // Create the edit button
      var editButton = document.createElement("button");
      editButton.id = "change-" + contentID;
      editButton.className = "btn text-primary edit-btn px-1";
      editButton.innerHTML = 'Save <i class="bx bx-save"></i>';
      editButton.addEventListener("click", function () {
        editContents(contentID, "video", true);
      });

      // Create the delete button
      var deleteButton = document.createElement("button");
      deleteButton.id = "delete-" + contentID;
      deleteButton.className = "btn text-danger edit-btn  px-1";
      deleteButton.innerHTML = '<i class="bx bx-trash" ></i>';
      deleteButton.addEventListener("click", function () {
        var elementToRemove = document.getElementById(contentID); // Replace with your actual element ID

        if (elementToRemove) {
          var siblingsToRemove = [elementToRemove.previousElementSibling];

          // Remove the element and its two above siblings
          elementToRemove.remove();
          siblingsToRemove.forEach(function (sibling) {
            if (sibling) {
              sibling.remove();
            }
          });
        }
      });

      // Append both buttons to the container div
      buttonContainer.className = "align-self-end d-flex flex-row";
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      // Append the container div to your main container
      container.appendChild(buttonContainer);

      //create New div _________________________________________________________
      // Create the main container div
      var wrapperDiv = document.createElement("div");
      wrapperDiv.id = contentID;
      wrapperDiv.className = "wrapper-ua";

      // Create the form element
      var formElement = document.createElement("form");
      formElement.id = "form-" + contentID;
      formElement.className = "form-ua text-primary";
      formElement.action = "#";

      // Create the file input element
      var fileInput = document.createElement("input");
      fileInput.className = "file-input";
      fileInput.type = "file";
      fileInput.name = "file";
      fileInput.hidden = true;

      // Create the cloud upload icon
      var cloudUploadIcon = document.createElement("i");
      cloudUploadIcon.className = "bx bx-cloud-upload text-primary";

      // Create the paragraph element
      var paragraphElement = document.createElement("p");
      paragraphElement.className = "m-0";
      paragraphElement.textContent = "Click To Upload Video";

      // Append elements to the form element
      formElement.appendChild(fileInput);
      formElement.appendChild(cloudUploadIcon);
      formElement.appendChild(paragraphElement);

      // Create the progress area section
      var progressArea = document.createElement("div");
      progressArea.className = "sec-ua progress-area";

      // Create the uploaded area section
      var uploadedArea = document.createElement("div");
      uploadedArea.className = "sec-ua uploaded-area";

      var uploadedArea = document.createElement("div");
      uploadedArea.className = "sec-ua uploaded-area";

      // Create the card div
      var cardDiv = document.createElement("div");
      cardDiv.innerHTML = `<div class="card-datatable table-responsive">
                <table class="list-video-edit table border-top">
                  <thead>
                    <tr>
                      <th></th>
                      <th>id</th>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                </table>
              </div>
            `;

      // Append all elements to the main container div
      wrapperDiv.appendChild(formElement);
      wrapperDiv.appendChild(progressArea);
      wrapperDiv.appendChild(uploadedArea);
      // Append the card div to the wrapperDiv
      wrapperDiv.appendChild(cardDiv);

      // Append the main container div to the document body (or any other parent element)
      container.appendChild(wrapperDiv);

      const form_uf = document.querySelector("#form-" + contentID);
      if (form_uf) {
        const fileInput = document.querySelector(".file-input");
        const progressArea = document.querySelector(".progress-area");
        const uploadedArea = document.querySelector(".uploaded-area");
        // form click event
        form_uf.addEventListener("click", () => {
          fileInput.click();
        });

        fileInput.onchange = ({ target }) => {
          let file = target.files[0]; //getting file [0] this means if user has selected multiple files then get first one only
          if (file) {
            let fileName = file.name; //getting file name
            if (fileName.length >= 12) {
              //if file name length is greater than 12 then split it and add ...
              let splitName = fileName.split(".");
              fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
            }
            // if (!(file.name.endsWith('.zip'))) {
            //   Swal.fire('Invalid File, must be .zip', '', 'error');
            //   return;
            // }
            Swal.fire({
              title: "Upload Verification",
              text: `Are you sure you want to upload "${file.name}"?`,
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Upload!",
              cancelButtonText: "Cancel",
              confirmButtonClass: "btn btn-primary",
              cancelButtonClass: "btn btn-outline-secondary ml-1",
              buttonsStyling: false,
            }).then((result) => {
              if (result.value) {
                // User clicked "Upload"
                uploadFile(file.name); // Replace with your upload function
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked "Cancel" or outside the modal
                Swal.fire(
                  "Cancelled",
                  "The upload process was cancelled",
                  "info"
                );
              }
            });
          }
        };
        // file upload function
        function uploadFile(name) {
          var contentValidatorElement =
            document.getElementById("contentValidator").value;
          let xhr = new XMLHttpRequest(); //creating new xhr object (AJAX)
          xhr.open("POST", "/upload/video/" + contentValidatorElement); //sending post request to the specified URL
          xhr.upload.addEventListener("progress", ({ loaded, total }) => {
            //file uploading progress event
            let fileLoaded = Math.floor((loaded / total) * 100); //getting percentage of loaded file size
            let fileTotal = Math.floor(total / 1000); //gettting total file size in KB from bytes
            let fileSize;
            // if file size is less than 1024 then add only KB else convert this KB into MB
            fileTotal < 1024
              ? (fileSize = fileTotal + " KB")
              : (fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB");
            let progressHTML = `<li class="row px-2">
                              <i class="fas fa-file-alt"></i>
                              <div class="content">
                                <div class="details">
                                <span class="name">${name} • Uploading</span>
                                <span class="percent">${fileLoaded}%</span>
                                </div>
                                <div class="progress-bar">
                                <div class="progress" style="width: ${fileLoaded}%"></div>
                                </div>
                              </div>
                              </li>`;
            // uploadedArea.innerHTML = ""; //uncomment this line if you don't want to show push history
            uploadedArea.classList.add("onprogress");
            progressArea.innerHTML = progressHTML;
            if (loaded == total) {
              progressArea.innerHTML = "";
              let uploadedHTML = `<li class="row px-2">
                                <div class="content upload">
                                <i class="fas fa-file-alt"></i>
                                <div class="details">
                                  <span class="name">${name} • Uploaded</span>
                                  <span class="size">${fileSize}</span>
                                </div>
                                </div>
                                <i class="fas fa-check"></i>
                              </li>`;
              uploadedArea.classList.remove("onprogress");
              // uploadedArea.innerHTML = uploadedHTML; //uncomment this line if you don't want to show push history
              uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML); //remove this line if you don't want to show push history
            }
          });
          let data = new FormData(form_uf); //FormData is an object to easily send form data
          xhr.onload = function () {
            if (xhr.status === 200) {
              // Successful response from PHP
              const response = JSON.parse(xhr.responseText);
            } else {
              console.error("Error:", xhr.status);
            }
          };
          xhr.send(data); //sending form data
        }
      }
      var dt_basic_table = $(".list-video-edit");
      if (dt_basic_table.length) {
        dt_basic = dt_basic_table.DataTable({
          ajax: "/table/video",
          columns: [
            { data: "" },
            { data: "id" },
            { data: "filename" },
            { data: "" },
          ],
          columnDefs: [
            {
              // For Responsive
              className: "control",
              orderable: false,
              searchable: false,
              responsivePriority: 2,
              targets: 0,
              render: function (data, type, full, meta) {
                return "";
              },
            },
            {
              targets: 1,
              searchable: false,
              visible: false,
            },
            {
              // Avatar image/badge, Name and post
              targets: 2,
              responsivePriority: 4,
              render: function (data, type, full, meta) {
                var $user_src = full["path"],
                  $id = full["id"],
                  $name = full["filename"],
                  $post = full["updated_by"],
                  $type = full["type"];
                $thumbnail = full["thumbnail"];
                if ($user_src) {
                  if ($type === "video") {
                    // For Avatar image
                    var $output =
                      '<video controls="" id="example-plyr-video-player-' +
                      $id +
                      '" playsinline="" poster="' +
                      $thumbnail +
                      '" width="" class="w-100 round" style="max-width:300px;"><source src="' +
                      $user_src +
                      '" type="video/mp4"></video>';
                  } else {
                    var $output =
                      '<img src="' +
                      assetsPath +
                      "img/avatars/" +
                      $user_src +
                      '" alt="Avatar" class="rounded-circle">';
                  }
                } else {
                  // For Avatar badge
                  var stateNum = Math.floor(Math.random() * 6);
                  var states = [
                    "success",
                    "danger",
                    "warning",
                    "info",
                    "dark",
                    "primary",
                    "secondary",
                  ];
                  var $state = states[stateNum],
                    $name = full["filename"],
                    $initials = $name.match(/\b\w/g) || [];
                  $initials = (
                    ($initials.shift() || "") + ($initials.pop() || "")
                  ).toUpperCase();
                  $output =
                    '<span class="avatar-initial rounded-circle bg-label-' +
                    $state +
                    '">' +
                    $initials +
                    "</span>";
                }
                // Creates full output for row
                var $row_output =
                  '<div class="d-flex justify-content-start align-items-center user-name">' +
                  '<div class="d-flex flex-column">' +
                  '<span class="emp_name text-truncate">' +
                  $name +
                  "</span>" +
                  '<small class="emp_post text-truncate text-muted">' +
                  $post +
                  "</small>" +
                  "</div>" +
                  "</div>";
                return $row_output;
              },
            },
            {
              // Actions
              targets: -1,
              title: "Actions",
              orderable: false,
              searchable: false,
              render: function (data, type, full, meta) {
                var $user_src = full["path"];
                return (
                  '<div class="d-inline-block">' +
                  '<a href="javascript:;" class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></a>' +
                  '<ul class="dropdown-menu dropdown-menu-end m-0">' +
                  '<li><a href="javascript:;" class="dropdown-item">Details</a></li>' +
                  '<li><a href="javascript:;" class="dropdown-item">Archive</a></li>' +
                  '<div class="dropdown-divider"></div>' +
                  '<li><a href="javascript:;" class="dropdown-item text-danger delete-record">Delete</a></li>' +
                  "</ul>" +
                  "</div>" +
                  "<a onclick=\"appendVideoFirst('" +
                  wrapperDiv.id +
                  "', `" +
                  $user_src +
                  '` )" class="btn btn-sm btn-icon item-edit"><i class="bx bxs-video-plus"></i></a>'
                );
              },
            },
          ],
          order: [[1, "desc"]],
          dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
          displayLength: 7,
          lengthMenu: [7, 10, 25, 50, 75, 100],
          buttons: [],
          responsive: {
            details: {
              display: $.fn.dataTable.Responsive.display.modal({
                header: function (row) {
                  var data = row.data();
                  return "Details of " + data["filename"];
                },
              }),
              type: "column",
              renderer: function (api, rowIdx, columns) {
                var data = $.map(columns, function (col, i) {
                  return col.title !== "" // ? Do not show row in modal popup if title is blank (for check box)
                    ? '<tr data-dt-row="' +
                        col.rowIndex +
                        '" data-dt-column="' +
                        col.columnIndex +
                        '">' +
                        "<td>" +
                        col.title +
                        ":" +
                        "</td> " +
                        "<td>" +
                        col.data +
                        "</td>" +
                        "</tr>"
                    : "";
                }).join("");

                return data
                  ? $('<table class="table"/><tbody />').append(data)
                  : false;
              },
            },
          },
        });
        $("div.card-header.flex-column").addClass("d-none");
        dt_basic_table.find("thead").addClass("d-none");
      }
    }
  });
  var newPdfButton = document.createElement("a");
  newPdfButton.className =
    "btn d-flex flex-column align-items-center justify-content-center text-primary";
  newPdfButton.innerHTML = '<i class="bx bxs-file-plus bx-lg" ></i>Pdf';
  newPdfButton.addEventListener("click", function () {
    i++;
    var contentID = stringId + i;

    if (document.getElementById("userLevel").value === "true") {
      // Create a container div to wrap the buttons
      var buttonContainer = document.createElement("div");

      // Create the edit button
      var editButton = document.createElement("button");
      editButton.id = "change-" + contentID;
      editButton.className = "btn text-primary edit-btn px-1";
      editButton.innerHTML = 'Save <i class="bx bx-save"></i>';
      editButton.addEventListener("click", function () {
        editContents(contentID);
      });

      // Create the delete button
      var deleteButton = document.createElement("button");
      deleteButton.id = "delete-" + contentID;
      deleteButton.className = "btn text-danger edit-btn  px-1";
      deleteButton.innerHTML = '<i class="bx bx-trash" ></i>';
      deleteButton.addEventListener("click", function () {
        var elementToRemove = document.getElementById(contentID); // Replace with your actual element ID

        if (elementToRemove) {
          var siblingsToRemove = [
            elementToRemove.previousElementSibling,
            elementToRemove.previousElementSibling.previousElementSibling,
          ];

          // Remove the element and its two above siblings
          elementToRemove.remove();
          siblingsToRemove.forEach(function (sibling) {
            if (sibling) {
              sibling.remove();
            }
          });
        }
      });

      // Append both buttons to the container div
      buttonContainer.className = "align-self-end d-flex flex-row";
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      // Append the container div to your main container
      container.appendChild(buttonContainer);

      //create New div
      var div = document.createElement("div");
      div.id = contentID;
      container.appendChild(div);
    }
    const fullToolbar = [
      [
        {
          font: [],
        },
        {
          size: [],
        },
      ],
      ["bold", "italic", "underline", "strike"],
      [
        {
          color: [],
        },
        {
          background: [],
        },
      ],
      [
        {
          script: "super",
        },
        {
          script: "sub",
        },
      ],
      [
        {
          header: "1",
        },
        {
          header: "2",
        },
        "blockquote",
        "code-block",
      ],
      [
        {
          list: "ordered",
        },
        {
          list: "bullet",
        },
        {
          indent: "-1",
        },
        {
          indent: "+1",
        },
      ],
      [{ direction: "rtl" }],
      ["link", "image", "video", "formula"],
      ["clean"],
    ];
    const fullEditor = new Quill("#" + contentID, {
      bounds: "#" + contentID,
      placeholder: "Type Something...",
      modules: {
        formula: true,
        toolbar: fullToolbar,
      },
      theme: "snow",
    });
  });
  var newQuizButton = document.createElement("a");
  newQuizButton.className =
    "btn d-flex flex-column align-items-center justify-content-center text-primary";
  newQuizButton.innerHTML = '<i class="bx bx-message-add bx-lg"></i>Quiz';
  newQuizButton.addEventListener("click", function () {
    i++;
    var contentID = stringId + i;

    if (document.getElementById("userLevel").value === "true") {
      // Create a container div to wrap the buttons
      var buttonContainer = document.createElement("div");

      // Create the edit button
      var editButton = document.createElement("button");
      editButton.id = "change-" + contentID;
      editButton.className = "btn text-primary edit-btn px-1";
      editButton.innerHTML = 'Save <i class="bx bx-save"></i>';
      editButton.addEventListener("click", function () {
        editContents(contentID);
      });

      // Create the delete button
      var deleteButton = document.createElement("button");
      deleteButton.id = "delete-" + contentID;
      deleteButton.className = "btn text-danger edit-btn  px-1";
      deleteButton.innerHTML = '<i class="bx bx-trash" ></i>';
      deleteButton.addEventListener("click", function () {
        var elementToRemove = document.getElementById(contentID); // Replace with your actual element ID

        if (elementToRemove) {
          var siblingsToRemove = [
            elementToRemove.previousElementSibling,
            elementToRemove.previousElementSibling.previousElementSibling,
          ];

          // Remove the element and its two above siblings
          elementToRemove.remove();
          siblingsToRemove.forEach(function (sibling) {
            if (sibling) {
              sibling.remove();
            }
          });
        }
      });

      // Append both buttons to the container div
      buttonContainer.className = "align-self-end d-flex flex-row";
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      // Append the container div to your main container
      container.appendChild(buttonContainer);

      //create New div
      var div = document.createElement("div");
      div.id = contentID;
      container.appendChild(div);
    }
    const fullToolbar = [
      [
        {
          font: [],
        },
        {
          size: [],
        },
      ],
      ["bold", "italic", "underline", "strike"],
      [
        {
          color: [],
        },
        {
          background: [],
        },
      ],
      [
        {
          script: "super",
        },
        {
          script: "sub",
        },
      ],
      [
        {
          header: "1",
        },
        {
          header: "2",
        },
        "blockquote",
        "code-block",
      ],
      [
        {
          list: "ordered",
        },
        {
          list: "bullet",
        },
        {
          indent: "-1",
        },
        {
          indent: "+1",
        },
      ],
      [{ direction: "rtl" }],
      ["link", "image", "video", "formula"],
      ["clean"],
    ];
    const fullEditor = new Quill("#" + contentID, {
      bounds: "#" + contentID,
      placeholder: "Type Something...",
      modules: {
        formula: true,
        toolbar: fullToolbar,
      },
      theme: "snow",
    });
  });

  var newContainerButton = document.createElement("div");
  newContainerButton.className = "add-new-content-btn";
  newContainerButton.className =
    "d-flex flex-row border my-3 align-items-center justify-content-center text-primary edit-btn";
  newContainerButton.appendChild(newContentButton);
  newContainerButton.appendChild(newVideoButton);
  newContainerButton.appendChild(newPdfButton);
  newContainerButton.appendChild(newQuizButton);

  // Insert the newContentButton after the mainCourseContent element
  container.insertAdjacentElement("afterend", newContainerButton);
}

function appendVideoFirst(idWrapper, videoSrc) {
  var parentElement = $("#" + idWrapper);

  // Check if the first child is a div with class 'plyr'
  if (parentElement.children().first().is("div.plyr")) {
    // If it is, remove the div
    parentElement.children().first().remove();
  }

  // Add the videoHTML as the first child of the parent element
  var videoHTML =
    '<video controls="" id="video-player-' +
    idWrapper +
    '" playsinline="" width="" class="w-100" ><source src="' +
    videoSrc +
    '" type="video/mp4"></video>';
  parentElement.prepend(videoHTML);

  // Initialize Plyr for the newly added video element
  const videoElements = document.querySelectorAll("video");
  videoElements.forEach(function (video, index) {
    console.log(video, index);
    if (!video.id) {
      video.id = "video-player-" + (index + 1);
    }
    const videoPlayer = new Plyr("#" + video.id);
  });
}

var contentValidatorElement = document.getElementById("contentValidator");

if (contentValidatorElement) {
  var contentValue = contentValidatorElement.value;

  fetch("/contents/" + contentValue)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then(function (data) {
      try {
        var parsedData = JSON.parse(data);
        var jsonObject = JSON.parse(parsedData.data);
        // console.log(jsonObject);
        jsonToHtml(jsonObject);
        makeIframeResponsive("ql-video", 3, 2);

        const videoElements = document.querySelectorAll("video");
        videoElements.forEach(function (video, index) {
          // Check if the video element has an ID
          if (!video.id) {
            // If not, set a new ID
            video.id = "video-player-" + (index + 1);
          }
          const videoPlayer = new Plyr("#" + video.id);
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    })
    .catch(function (error) {
      console.log("Error fetching content:", error);
    });
}
function makeIframeResponsive(
  containerClass,
  aspectRatioWidth,
  aspectRatioHeight
) {
  // Get all elements with the specified class
  var iframes = document.getElementsByClassName(containerClass);

  // Function to update the height based on the width
  function updateIframeHeight(iframe) {
    iframe.style.width = "100%";
    var currentWidth = iframe.offsetWidth;
    var calculatedHeight =
      (currentWidth * aspectRatioHeight) / aspectRatioWidth;
    iframe.style.height = calculatedHeight + "px";

    // Prevent right-click on the iframe
    iframe.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    // Prevent long press on the iframe (for touchscreen devices)
    iframe.addEventListener("touchstart", function (e) {
      var now = new Date().getTime();
      var delta = now - (iframe.touchstart || now + 1);
      iframe.touchstart = now;
      if (delta < 500 && delta > 0) {
        e.preventDefault();
      }
    });
  }

  // Function to apply the updateIframeHeight function to all elements
  function updateAllIframesHeight() {
    for (var i = 0; i < iframes.length; i++) {
      updateIframeHeight(iframes[i]);
    }
  }

  // Call the function on initial page load
  updateAllIframesHeight();

  // Listen for window resize events to update the height dynamically
  window.addEventListener("resize", updateAllIframesHeight);
}

function editContents(contentID, type, isNewUpload) {
  const btnChange = document.getElementById("change-" + contentID);
  if (btnChange.innerHTML.includes("Edit")) {
    btnChange.innerHTML = 'Save <i class="bx bx-save"></i>';
    const fullToolbar = [
      [
        {
          font: [],
        },
        {
          size: [],
        },
      ],
      ["bold", "italic", "underline", "strike"],
      [
        {
          color: [],
        },
        {
          background: [],
        },
      ],
      [
        {
          script: "super",
        },
        {
          script: "sub",
        },
      ],
      [
        {
          header: "1",
        },
        {
          header: "2",
        },
        "blockquote",
        "code-block",
      ],
      [
        {
          list: "ordered",
        },
        {
          list: "bullet",
        },
        {
          indent: "-1",
        },
        {
          indent: "+1",
        },
      ],
      [{ direction: "rtl" }],
      ["link", "image", "video", "formula"],
      ["clean"],
    ];
    const fullEditor = new Quill("#" + contentID, {
      bounds: "#" + contentID,
      placeholder: "Type Something...",
      modules: {
        formula: true,
        toolbar: fullToolbar,
      },
      theme: "snow",
    });
  } else {
    const parentElement = document.getElementById(contentID);
    const firstChild = parentElement.children[0];

    // Alternatively, if you want to check if the first child is a form
    if (firstChild.tagName.toLowerCase() === "form") {
      Swal.fire("Error!", "Please Choose Content", "error");
      return;
    }

    if (type === "video" && isNewUpload == true) {
      Swal.fire({
        title: "Do you want to Upload New Content?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          if (parentElement.children.length > 0) {
            const postData = {
              level: 0,
              data: firstChild.querySelector("video").outerHTML,
            };

            fetch("/contents/" + contentValue, {
              method: "POST",
              headers: {
                "Content-Type": "application/json", // or 'application/x-www-form-urlencoded' depending on your server expectations
                // Add any other headers if needed
              },
              // Convert the postData object to JSON format if sending JSON data
              body: JSON.stringify(postData),
            })
              .then(function (response) {
                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
                return response.text();
              })
              .then(function (data) {
                // console.log(data);
                btnChange.innerHTML = 'Edit <i class="bx bx-edit"></i>';
                // Get all child elements except the first one
                var childElementsToRemove = Array.from(
                  parentElement.children
                ).slice(1);

                // Remove each child element
                childElementsToRemove.forEach(function (childElement) {
                  parentElement.removeChild(childElement);
                });

                Swal.fire("Saved!", "Your changes have been saved.", "success");
              })
              .catch(function (error) {
                Swal.fire("Error!", "Your changes Failed to saved.", "error");
                console.log("Error fetching content:", error);
              });
          }
        }
      });
    } else {
      const parts = contentID.split("-");
      const lastNumber = Number(parts[parts.length - 1]);
      const parentElement = document.getElementById(contentID);

      Swal.fire({
        title: "Do you want to save changes?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          btnChange.innerHTML = 'Edit <i class="bx bx-edit"></i>';
          if (parentElement.previousElementSibling) {
            const previousSibling = parentElement.previousElementSibling;
            previousSibling.parentNode.removeChild(previousSibling);
          }

          if (parentElement.children.length > 0) {
            // Step 3: Get a reference to the first child
            const firstChild = parentElement.children[0];

            Array.from(firstChild.attributes).forEach((attribute) => {
              firstChild.removeAttribute(attribute.name);
            });
            firstChild.id = contentID;
            parentElement.parentNode.replaceChild(firstChild, parentElement);
            const postData = {
              level: lastNumber,
              data: firstChild.innerHTML,
            };
            console.log(firstChild.innerHTML);

            fetch("/contents/" + contentValue, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json", // or 'application/x-www-form-urlencoded' depending on your server expectations
                // Add any other headers if needed
              },
              // Convert the postData object to JSON format if sending JSON data
              body: JSON.stringify(postData),
            })
              .then(function (response) {
                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
                return response.text();
              })
              .then(function (data) {
                console.log(data);
                Swal.fire("Saved!", "Your changes have been saved.", "success");
              })
              .catch(function (error) {
                Swal.fire("Error!", "Your changes Failed to saved.", "error");
                console.log("Error fetching content:", error);
              });
          }
        } else {
          // User clicked "Cancel" or closed the dialog
          // Swal.fire('Cancelled', 'Your changes have not been saved.', 'info');
        }
      });
    }
  }
}
function deleteContents(contentID) {
  Swal.fire({
    title: "ARE YOU SURE TO DELETE?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "I AM SURE",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      const parts = contentID.split("-");
      const lastNumber = Number(parts[parts.length - 1]);
      const postData = {
        level: lastNumber,
      };

      fetch("/contents/" + contentValue, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json", // or 'application/x-www-form-urlencoded' depending on your server expectations
          // Add any other headers if needed
        },
        // Convert the postData object to JSON format if sending JSON data
        body: JSON.stringify(postData),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.text();
        })
        .then(function (data) {
          console.log(data);
          Swal.fire("Saved!", "Your content have been DELETED.", "success");
        })
        .catch(function (error) {
          Swal.fire("Error!", "Your content Failed to delete.", "error");
          console.log("Error fetching content:", error);
        });
    }
  });
}
function viewBtn() {
  document.querySelectorAll(".edit-btn").forEach(function (element) {
    element.classList.toggle("d-flex");
    element.classList.toggle("d-none");
  });
}

/**
 * @global TABLE KONFIRMASI DATA PENGERJAAN
 */
//

async function getImage(imageURL, containerId, altText, defJPG) {
  let imgWidth = "200px";
  let imgHeight = "auto";

  fetch(imageURL, { method: "HEAD" }) // Only check if image exists
    .then((response) => {
      let img = document.createElement("img");
      img.style.width = imgWidth;
      img.style.height = imgHeight;
      img.className = "card-img-top";
      img.alt = altText;
      img.onclick = function () {
        window.open(img.src, "_blank");
      };

      if (response.ok) {
        img.src = imageURL; // Use the real image
      } else {
        img.src = defJPG; // Use default
      }

      document.getElementById(containerId).prepend(img);
    })
    .catch(() => {
      let img = document.createElement("img");
      img.style.width = imgWidth;
      img.style.height = imgHeight;
      img.className = "card-img-top";
      img.alt = altText;
      img.src = defJPG; // Use default image on error
      document.getElementById(containerId).prepend(img);
    });
}

// PENDING
async function sendCekPending(button) {
  // Cari elemen input yang terdekat di dalam card yang sama
  let card = button.closest(".card-cek");
  let id_task = card.querySelector(".id_task").value;

  // console.log("ID Task: "+id_task);

  // Buat objek JSON
  let postData = {
    id_task: id_task,
  };

  // Tampilkan SweetAlert dengan loading
  Swal.fire({
    title: "Processing...",
    text: "Data sedang di check...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    let response = await fetch("/here/checkData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    // console.log("BODY:"+JSON.stringify(postData));

    let result = await response.json();
    // console.log("RESULT: " + JSON.stringify(result, null, 2));

    // Jika request berhasil
    Swal.fire({
      title: "Berhasil!",
      text: "Data berhasil dicek.",
      icon: "success",
      timer: 5000, // Auto close dalam 5 detik
      showConfirmButton: false,
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("Error:", error);

    // Jika request gagal
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan saat check data.",
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  }
}

async function sendDataKonfirmasiPending(button) {
  // Cari elemen input yang terdekat di dalam card yang sama
  let card = button.closest(".card");
  let email = card.querySelector(".email").value;
  let password = card.querySelector(".password").value;
  let id_task = card.querySelector(".id_task").value;

  // Buat objek JSON
  let postData = {
    email: email,
    password: password,
    id_task: id_task,
  };

  // Tampilkan SweetAlert dengan loading
  Swal.fire({
    title: "Processing...",
    text: "Data sedang di proses...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    let response = await fetch("/here/postData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    let result = await response.json();

    // Jika request berhasil
    Swal.fire({
      title: "Berhasil!",
      text: "Data berhasil dikirim.",
      icon: "success",
      timer: 5000, // Auto close dalam 5 detik
      showConfirmButton: false,
    });

    // Reload halaman setelah 5 detik
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  } catch (error) {
    console.error("Error:", error);

    // Jika request gagal
    Swal.fire({
      title: "Gagal!",
      text:
        "Terjadi kesalahan saat mengirim data." +
        (error && error.message ? `\nDetail: ${error.message}` : ""),
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  }
}

async function sendDataHapusPending(button) {
  // Cari elemen input yang terdekat di dalam card yang sama
  let card = button.closest(".card");
  let email = card.querySelector(".email").value;
  let password = card.querySelector(".password").value;
  let id_task = card.querySelector(".id_task").value;
  let ta_remark = card.querySelector(".ta_remark").value;

  // Buat objek JSON
  let postData = {
    email: email,
    password: password,
    id_task: id_task,
    reason: ta_remark,
  };

  // Tampilkan SweetAlert dengan loading
  Swal.fire({
    title: "Processing...",
    text: "Data sedang di proses...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    let response = await fetch("/here/deleteData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    let result = await response.json();

    // Jika request berhasil
    Swal.fire({
      title: "Berhasil!",
      text: "Data berhasil dihapus.",
      icon: "success",
      timer: 5000, // Auto close dalam 5 detik
      showConfirmButton: false,
    });

    // Reload halaman setelah 5 detik
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  } catch (error) {
    console.error("Error:", error);

    // Jika request gagal
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan saat menghapus data.",
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  }
}

// ERROR
async function sendCekError(button) {
  // Cari elemen input yang terdekat di dalam card yang sama
  let card = button.closest(".card-cek");
  let id_task = card.querySelector(".id_task").value;

  console.log("ID Task: " + id_task);

  // Buat objek JSON
  let postData = {
    id_task: id_task,
  };

  // Tampilkan SweetAlert dengan loading
  Swal.fire({
    title: "Processing...",
    text: "Data sedang di check...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    let response = await fetch("/here/checkData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    let result = await response.json();

    // Jika request berhasil
    Swal.fire({
      title: "Berhasil!",
      text: "Data berhasil dicek.",
      icon: "success",
      timer: 5000, // Auto close dalam 5 detik
      showConfirmButton: false,
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("Error:", error);

    // Jika request gagal
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan saat check data.",
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  }
}

async function sendDataKonfirmasiError(button) {
  // Cari elemen input yang terdekat di dalam card yang sama
  let card = button.closest(".card");
  let email = card.querySelector(".email").value;
  let password = card.querySelector(".password").value;
  let id_task = card.querySelector(".id_task").value;

  // Buat objek JSON
  let postData = {
    email: email,
    password: password,
    id_task: id_task,
  };

  // Tampilkan SweetAlert dengan loading
  Swal.fire({
    title: "Processing...",
    text: "Data sedang di proses...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    let response = await fetch("/here/postData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    let result = await response.json();

    // Jika request berhasil
    Swal.fire({
      title: "Berhasil!",
      text: "Data berhasil dikirim.",
      icon: "success",
      timer: 5000, // Auto close dalam 5 detik
      showConfirmButton: false,
    });

    // Reload halaman setelah 5 detik
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  } catch (error) {
    console.error("Error:", error);

    // Jika request gagal
    Swal.fire({
      title: "Gagal!",
      text:
        "Terjadi kesalahan saat mengirim data." +
        (error && error.message ? `\nDetail: ${error.message}` : ""),
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  }
}

async function sendDataHapusError(button) {
  // Cari elemen input yang terdekat di dalam card yang sama
  let card = button.closest(".card");
  let email = card.querySelector(".email").value;
  let password = card.querySelector(".password").value;
  let id_task = card.querySelector(".id_task").value;
  let ta_remark = card.querySelector(".ta_remark").value;

  // Buat objek JSON
  let postData = {
    email: email,
    password: password,
    id_task: id_task,
    reason: ta_remark,
  };

  // Tampilkan SweetAlert dengan loading
  Swal.fire({
    title: "Processing...",
    text: "Data sedang di proses...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    let response = await fetch("/here/deleteData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    let result = await response.json();

    // Jika request berhasil
    Swal.fire({
      title: "Berhasil!",
      text: "Data berhasil dihapus.",
      icon: "success",
      timer: 5000, // Auto close dalam 5 detik
      showConfirmButton: false,
    });

    // Reload halaman setelah 5 detik
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  } catch (error) {
    console.error("Error:", error);

    // Jika request gagal
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan saat menghapus data.",
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  }
}

/**
 * @global WEBSOCKET INFO NEW DATA REALTIME
 */
/** ------------------------------------------------------------------------------------------------------------------------ **/
// let wsTableDataPending = "pending";
// let wsTableDataError = "error";
// let wsProtocolRealtime = window.location.protocol === "https:" ? "wss:" : "ws:";
// const socketUrlPending = `${wsProtocolRealtime}//${window.location.host}/ws-realtime?data=${wsTableDataPending}`;
// const socketUrlError = `${wsProtocolRealtime}//${window.location.host}/ws-realtime?data=${wsTableDataError}`;

// let wsRealtimePending = "Web Socket Realtime Pending";
// let wsRealtimeError = "Web Socket Realtime Error";

// let socketPending, socketError;

// // Speech Mutex
// let isSpeaking = false;
// let synth = window.speechSynthesis;

// // Function to speak Indonesian text (Mutex Ensured)
// function speakIndonesian(text) {
//   if (isSpeaking) {
//     synth.cancel(); // Stop previous speech before starting a new one
//   }

//   let utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = "id-ID";
//   utterance.volume = 1;
//   utterance.rate = 1;
//   utterance.pitch = 1;

//   let voices = synth.getVoices();
//   let indoVoice = voices.find(voice => voice.lang === "id-ID");
//   if (indoVoice) {
//     utterance.voice = indoVoice;
//   } else {
//     console.warn("⚠️ Indonesian voice not found! Using default voice.");
//   }

//   utterance.onstart = () => {
//     isSpeaking = true;
//   };

//   utterance.onend = () => {
//     isSpeaking = false;
//   };

//   synth.speak(utterance);
// }

// let audioQueue = [];
// let isPlaying = false;
// let isUserInteracted = false; // Track user interaction

// async function playNext() {
//   if (audioQueue.length === 0) {
//     isPlaying = false;
//     return;
//   }

//   isPlaying = true;
//   let audioSrc = audioQueue.shift();
//   let audio = new Audio(audioSrc);

//   audio.onended = () => {
//     isPlaying = false;
//     playNext(); // Play the next sound
//   };

//   audio.onerror = (err) => {
//     console.error("Playback error:", err);
//     isPlaying = false;
//     playNext(); // Skip and play the next sound
//   };

//   if (isUserInteracted) {
//     try {
//       await audio.play();
//     } catch (err) {
//       console.error("Playback error:", err);
//     }
//   }
// }

// async function playSound(url) {
//   audioQueue.push(url);
//   if (!isPlaying && isUserInteracted) {
//     await playNext();
//   }
// }

// // ✅ Ensure Audio Works After Refresh
// document.addEventListener("click", () => {
//   if (!isUserInteracted) {
//     isUserInteracted = true;
//     console.log("✅ User interacted. Audio is now allowed!");
//     if (audioQueue.length > 0) {
//       playNext(); // Start playing queued sounds
//     }
//   }
// }, { once: true }); // Only runs once

// // Function to create WebSocket and return as Promise
// async function createWebSocket(url, wsRealtime, type) {
//   return new Promise((resolve, reject) => {
//     let socket = new WebSocket(url);

//     socket.onopen = () => {
//       console.log(`${wsRealtime} Connected`);
//       resolve(socket);
//     };

//     socket.onmessage = (event) => {
//       let data = JSON.parse(event.data);
//       let popupMsg = `NEW ${type.toUpperCase()} DATA! [${data.id}] ${data.wo} ${data.type} - Teknisi: ${data.teknisi}`;

//       if (type === "error") {
//         popupMsg += ` mengalami masalah: ${data.problem}`;
//       }

//       popupMsg += ` di merchant: ${data.merchant}, TID: ${data.tid}, RC: ${data.reason}`;

//       // showIziToast("info", popupMsg);
//       // speakIndonesian(`KRING NEW ${type.toUpperCase()} DATA!`);
//       playSound(`/assets/audio/notification/${type.toLowerCase()}.wav`);
//     };

//     socket.onerror = (error) => {
//       console.error(wsRealtime + " Error:", error);
//       reject(error);
//     };

//     socket.onclose = async () => {
//       console.warn(wsRealtime + " closed. Reconnecting in 3 seconds...");
//       await new Promise(res => setTimeout(res, 3000));
//       resolve(await createWebSocket(url, wsRealtime, type));
//     };
//   });
// }

// // Function to start both WebSockets
// async function startSockets() {
//   try {
//     socketPending = await createWebSocket(socketUrlPending, wsRealtimePending, "pending");
//     socketError = await createWebSocket(socketUrlError, wsRealtimeError, "error");
//   } catch (err) {
//     console.error("Error starting WebSockets:", err);
//   }
// }

// // Visibility API: Restart WebSockets when tab is active
// document.addEventListener("visibilitychange", async () => {
//   if (document.visibilityState === "visible") {
//     console.log("Tab is active. Reconnecting WebSockets...");
//     await startSockets();
//   }
// });

// // Start WebSockets initially
// startSockets();
/** ------------------------------------------------------------------------------------------------------------------------ **/
// let wsTableDataPending = "pending";
// let wsTableDataError = "error";
// let wsProtocolRealtime = window.location.protocol === "https:" ? "wss:" : "ws:";
// const socketUrlPending = `${wsProtocolRealtime}//${window.location.host}/ws-realtime?data=${wsTableDataPending}`;
// const socketUrlError = `${wsProtocolRealtime}//${window.location.host}/ws-realtime?data=${wsTableDataError}`;

// let wsRealtimePending = "Web Socket Realtime Pending";
// let wsRealtimeError = "Web Socket Realtime Error";

// let socketPending, socketError;

// // 🔹 Create an AudioContext (to unlock autoplay)
// let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// let audioQueue = [];
// let isPlaying = false;

// // 🔹 Unlock Audio on Page Load
// async function unlockAudio() {
//   if (audioCtx.state === "suspended") {
//     try {
//       await audioCtx.resume();
//       // console.log("✅ AudioContext resumed. Audio is now allowed!");
//     } catch (err) {
//       console.warn("⚠️ Failed to resume AudioContext:", err);
//     }
//   }
// }

// // 🔹 Play the next sound in the queue
// async function playNext() {
//   if (audioQueue.length === 0) {
//     isPlaying = false;
//     return;
//   }

//   isPlaying = true;
//   let audioSrc = audioQueue.shift();
//   let audio = new Audio(audioSrc);

//   audio.onended = () => {
//     isPlaying = false;
//     playNext(); // Play the next sound in the queue
//   };

//   audio.onerror = (err) => {
//     console.error("Playback error:", err);
//     isPlaying = false;
//     playNext(); // Skip and continue playing queue
//   };

//   try {
//     await unlockAudio(); // Ensure audio is unlocked before playing
//     await audio.play();
//   } catch (err) {
//     console.error("Playback error:", err);
//     isPlaying = false;
//   }
// }

// // 🔹 Add sound to queue and play it
// async function playSound(url) {
//   audioQueue.push(url);
//   if (!isPlaying) {
//     await playNext();
//   }
// }

// // ✅ Ensure Audio Works After Refresh
// document.addEventListener("click", async () => {
//   await unlockAudio();
// }, { once: true });

// // 🔹 Function to create WebSocket
// async function createWebSocket(url, wsRealtime, type) {
//   return new Promise((resolve, reject) => {
//     let socket = new WebSocket(url);

//     socket.onopen = () => {
//       console.log(`${wsRealtime} Connected`);
//       resolve(socket);
//     };

//     socket.onmessage = (event) => {
//       let data = JSON.parse(event.data);
//       let popupMsg = `NEW ${type.toUpperCase()} DATA! [${data.id}] ${data.wo} ${data.type} - Teknisi: ${data.teknisi}`;

//       if (type === "error") {
//         popupMsg += ` mengalami masalah: ${data.problem}`;
//       }

//       popupMsg += ` di merchant: ${data.merchant}, TID: ${data.tid}, RC: ${data.reason}`;

//       // console.log("🔔 Incoming WebSocket Data:", popupMsg);
//       let notifFile = type.toLowerCase() + "_okegas";

//       // 🔊 Play Sound
//       playSound(`/assets/audio/notification/${notifFile}.wav`);
//     };

//     socket.onerror = (error) => {
//       console.error(wsRealtime + " Error:", error);
//       reject(error);
//     };

//     socket.onclose = async () => {
//       console.warn(wsRealtime + " closed. Reconnecting in 3 seconds...");
//       await new Promise(res => setTimeout(res, 3000));
//       resolve(await createWebSocket(url, wsRealtime, type));
//     };
//   });
// }

// // 🔹 Function to start WebSockets
// async function startSockets() {
//   try {
//     socketPending = await createWebSocket(socketUrlPending, wsRealtimePending, "pending");
//     socketError = await createWebSocket(socketUrlError, wsRealtimeError, "error");
//   } catch (err) {
//     console.error("Error starting WebSockets:", err);
//   }
// }

// // 🔹 Visibility API: Restart WebSockets when tab is active
// document.addEventListener("visibilitychange", async () => {
//   if (document.visibilityState === "visible") {
//     console.log("Tab is active. Reconnecting WebSockets...");
//     await startSockets();
//   }
// });

// // 🔹 Start WebSockets initially
// startSockets();

// // ✅ Force Unlock Audio on Page Load
// unlockAudio();
/** ------------------------------------------------------------------------------------------------------------------------ **/

// Edit Data
async function sendEditData(button) {
  let card = button.closest(".card-edit-data");
  let id_task = card.querySelector(".id_task").value;
  let woNumber = card.querySelector(".wo_number").value;
  let company = card.querySelector(".company").value;
  let reasonCode = card.querySelector(".reason_code").value;
  let woRemark = card.querySelector(".wo_remark").value;
  let taFeedback = card.querySelector(".editable-feedback").value;

  Swal.fire({
    icon: "warning",
    // title: `<span class="text-danger">Confirm Edit</span>`,
    html: `Apakah Anda yakin ingin mengubah data dengan WO Number: <b>${woNumber}</b>?`,
    showCancelButton: true,
    confirmButtonText: "Ya, Edit",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      confirmButton: "btn btn-primary",
      cancelButton: "btn btn-danger",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      modalFormEditDataWO(
        id_task,
        woNumber,
        company,
        reasonCode,
        woRemark,
        taFeedback
      );
    }
  });
}

async function handleHashChange() {
  const hash = window.location.hash;

  if (hash.includes("data-error")) {
    return "error";
  } else if (hash.includes("data-pending")) {
    return "pending";
  }
}

async function modalFormEditDataWO(
  id_task,
  woNumber,
  company,
  reasonCode,
  woRemark,
  taFeedback
) {
  let modal = document.querySelector(".modal.show");
  if (modal) {
    modal.setAttribute("inert", ""); // Prevent interactions, but keep it visible
  }

  let userEmail = $(".userData").data("user-email");
  let currentTab = await handleHashChange();

  // Run on hash change (when user switches tab)
  $(window).on("hashchange", function () {
    currentTab = handleHashChange();
  });

  let paidCheckbox = "";
  switch (currentTab) {
    case "error":
      paidCheckbox = "";
      break;
    case "pending":
      paidCheckbox = `
        <div class="col-lg-2 col-md-6 col-sm-6 d-flex align-items-center">
          <div class="form-check d-flex align-items-center mt-4 mx-3">
            <input class="form-check-input me-2" type="checkbox" id="edit-data-status">
            <label for="edit-data-status" class="form-check-label">Paid?</label>
          </div>
        </div>
      `;
      break;
  }

  console.log("#==# Current Tab: " + currentTab);

  const { value: formValues } = await Swal.fire({
    title: "",
    html: `
    <form id="taskEdit" class="container-fluid">
      <h1 class="text-warning mb-5 display-3">
        EDIT DATA
      </h1>

      <div class="row align-items-center gx-3 gy-2">
        <!-- Paid Checkbox -->
        
        ${
          paidCheckbox ||
          '<div class="col-lg-2 col-md-6 col-sm-6 d-flex align-items-center"></div>'
        }

        <!-- Task ID -->
        <div class="col-lg-2 col-md-6 col-sm-6">
          <label for="edit-data-task" class="form-label small mb-1"><b>${woNumber}</b></label>
          <input type="text" class="form-control bg-label-secondary" id="edit-data-task" value="${id_task}" readonly>
        </div>

        <!-- Email -->
        <div class="col-lg-4 col-md-6 col-sm-12">
          <label for="edit-data-name" class="form-label small mb-1">Email</label>
          <input type="text" class="form-control" id="edit-data-name" value="${userEmail}" placeholder="Masukkan email ODOO">
        </div>

        <!-- Password -->
        <div class="col-lg-4 col-md-6 col-sm-12">
          <label for="edit-data-password" class="form-label small mb-1">Password</label>
          <input type="password" class="form-control" id="edit-data-password" placeholder="Masukkan password Anda">
        </div>
      </div>

      <div class="row gx-3 gy-3 mb-4">
        <!-- TA Feedback -->
        <div class="col-12 mt-3">
          <label for="" class="form-label">TA Feedback</label>
          <textarea class="form-control" id="edit-feedback">
            ${taFeedback.trim()}
          </textarea>
        </div>

        <!-- Reason -->
        <div class="col-12">
          <label for="edit-data-reason" class="form-label">Reason Code</label>
          <select class="form-select" id="edit-data-reason">
            <!-- Dynamic option -->
          </select>
        </div>

        <!-- Keterangan / WO Remark -->
        <div class="col-12">
          <label for="edit-data-keterangan" class="form-label">Keterangan / WO Remark</label>
          <textarea id="edit-data-keterangan" class="form-control" placeholder="Input keterangan JO / WO Remark" rows="3">${woRemark}</textarea>
        </div>

        <!-- Supply Thermal -->
        <div class="col-12">
          <label for="edit-data-supply-thermal" class="form-label">Supply Thermal</label>
          <input 
            type="number" 
            id="edit-data-supply-thermal" 
            class="form-control" 
            placeholder="Masukkan jumlah supply thermal" 
            min="0" 
            max="3000">
        </div>

        <!-- File Uploads with Preview -->
        <div class="col-12">
          <label class="form-label fw-bold">Upload Foto</label>
          <div class="row gx-2 gy-2">
            ${[
              { id: "x_foto_bast", label: "Foto BAST" },
              { id: "x_foto_ceklis", label: "Foto Media Promo" },
              { id: "x_foto_edc", label: "Foto SN EDC" },
              { id: "x_foto_pic", label: "Foto PIC Merchant" },
              { id: "x_foto_setting", label: "Foto Pengaturan" },
              { id: "x_foto_thermal", label: "Foto Thermal" },
              { id: "x_foto_toko", label: "Foto Merchant" },
              { id: "x_foto_training", label: "Foto Surat Training" },
              { id: "x_foto_transaksi", label: "Foto Transaksi" },
              { id: "x_tanda_tangan_pic", label: "Tanda Tangan PIC" },
              { id: "x_tanda_tangan_teknisi", label: "Tanda Tangan Teknisi" },
              { id: "x_foto_sticker_edc", label: "Foto Stiker EDC" },
              { id: "x_foto_screen_guard", label: "Foto Screen Gard" },
              {
                id: "x_foto_all_transaction",
                label: "Foto Sales Draft All Memberbank",
              },
              { id: "x_foto_transaksi_bmri", label: "Foto Sales Draft BMRI" },
              { id: "x_foto_transaksi_bni", label: "Foto Sales Draft BNI" },
              { id: "x_foto_transaksi_bri", label: "Foto Sales Draft BRI" },
              { id: "x_foto_transaksi_btn", label: "Foto Sales Draft BTN" },
              {
                id: "x_foto_transaksi_patch",
                label: "Foto Sales Draft Patch L",
              },
              { id: "x_foto_screen_p2g", label: "Foto Screen P2G" },
              {
                id: "x_foto_kontak_stiker_pic",
                label: "Foto Kontak Stiker PIC",
              },
            ]
              .map(
                ({ id, label }) => `
              <div class="col-md-4">
                <label for="edit-data-${id}" class="form-label">${label}</label>
                <input type="file" class="form-control" id="edit-data-${id}" accept="image/*" onchange="previewImage(event, '${id}')">
                <img id="preview-${id}" src="" alt="Preview" class="img-thumbnail mt-2 d-none" style="max-width: 100px;">
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    </form>
  `,
    customClass: {
      confirmButton: "btn btn-primary",
      cancelButton: "btn btn-danger",
    },
    width: "90vw",
    showCancelButton: true,
    confirmButtonText: "Update",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    didOpen: () => {
      setTimeout(() => {
        document.getElementById("edit-data-name").focus();
      }, 200);

      document.querySelector(".swal2-container").style.zIndex = "1100";

      $.ajax({
        url: "/here/listReason",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ company: company }), // Send JSON body
        success: function (data) {
          let reasonSelect = $("#edit-data-reason");
          reasonSelect.empty(); // Clear existing options

          // Default option
          reasonSelect.append(
            '<option value="" disabled selected>Pilih reason code yang sesuai</option>'
          );

          // Convert reasonCode to lowercase for case-insensitive comparison
          let reasonCodeLower = reasonCode.toLowerCase();

          // Append options from the response
          $.each(data, function (id, label) {
            let labelLower = label.toLowerCase(); // Convert API response to lowercase

            let option = $("<option>", {
              value: id,
              text: label,
              selected: reasonCodeLower === labelLower, // Set selected if it matches
            });

            reasonSelect.append(option);
          });
        },
        error: function (xhr, status, error) {
          // Show an error alert using SweetAlert2
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Gagal mengambil Reason Codes! Coba lagi.",
            footer: `<small>Error: ${xhr.status} - ${error}</small>`,
          });
        },
      });
    },
    preConfirm: () => {
      let name = document.getElementById("edit-data-name").value;
      let password = document.getElementById("edit-data-password").value;
      let task = document.getElementById("edit-data-task").value;
      let reason = document.getElementById("edit-data-reason").value;
      let keterangan = document.getElementById("edit-data-keterangan").value;
      let feedback = document.getElementById("edit-feedback").value;
      let supplyThermal = document.getElementById(
        "edit-data-supply-thermal"
      ).value;
      feedback = feedback.trim();
      let isPaid = false;
      if ($("#edit-data-status").length) {
        isPaid = $("#edit-data-status").is(":checked");
      }

      console.log("Paid Status: " + isPaid);

      /**
       * Try to update feedback first
       */

      $.ajax({
        url: "/ta_feedback",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          tabel: currentTab,
          id_task: id_task,
          wo_number: woNumber,
          feedback: feedback,
        }),
        success: function (res) {
          console.log(res);
        },
        error: function (xhr) {
          let msg = "Terjadi kesalahan: " + xhr.responseText;
          try {
            const res = JSON.parse(xhr.responseText);
            msg = res.message || msg;
          } catch (e) {}

          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: msg,
            confirmButtonText: "Coba Lagi",
          });
        },
      });

      /**
       * .end of try to update feedback first
       */

      // Get all file inputs
      let fileIds = [
        "edit-data-x_foto_bast",
        "edit-data-x_foto_ceklis",
        "edit-data-x_foto_edc",
        "edit-data-x_foto_pic",
        "edit-data-x_foto_setting",
        "edit-data-x_foto_thermal",
        "edit-data-x_foto_toko",
        "edit-data-x_foto_training",
        "edit-data-x_foto_transaksi",
        "edit-data-x_tanda_tangan_pic",
        "edit-data-x_tanda_tangan_teknisi",
        "edit-data-x_foto_sticker_edc",
        "edit-data-x_foto_screen_guard",
        "edit-data-x_foto_all_transaction",
        "edit-data-x_foto_transaksi_bmri",
        "edit-data-x_foto_transaksi_bni",
        "edit-data-x_foto_transaksi_bri",
        "edit-data-x_foto_transaksi_btn",
        "edit-data-x_foto_transaksi_patch",
        "edit-data-x_foto_screen_p2g",
        "edit-data-x_foto_kontak_stiker_pic",
      ];

      let files = {};
      fileIds.forEach((id) => {
        let fileInput = document.getElementById(id);
        if (fileInput && fileInput.files.length > 0) {
          files[id.replace("edit-data-", "")] = fileInput.files[0];
        }
      });

      if (!name || !password || !task || !reason || !keterangan) {
        Swal.showValidationMessage(
          "Alamat email, password, ID task, reason code dan keterangan / wo remark harus diisi!"
        );
        return false;
      }

      return {
        name,
        password,
        task,
        reason,
        keterangan,
        files,
        isPaid,
        supplyThermal,
      };
    },
  });

  if (modal) {
    modal.removeAttribute("inert");
  }

  if (formValues) {
    const thermalValue = Number(formValues.supplyThermal);

    if (thermalValue > 3000) {
      await Swal.fire({
        icon: "warning",
        title: "Jumlah Supply Thermal terlalu besar!",
        text: "Maksimum jumlah supply thermal adalah 3000.",
        confirmButtonText: "OK",
      });
      return; // stop execution
    }

    // Build formData once
    let formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("password", formValues.password);
    formData.append("task", formValues.task);
    formData.append("reason", formValues.reason);
    formData.append("keterangan", formValues.keterangan);
    formData.append("isPaid", formValues.isPaid);

    if (formValues.supplyThermal !== "" && thermalValue > 0) {
      formData.append("thermal", formValues.supplyThermal);
    }

    // Append all selected files
    Object.keys(formValues.files).forEach((key) => {
      formData.append(key, formValues.files[key]);
    });

    // Show processing alert
    Swal.fire({
      title: "Processing...",
      text: "Mohon bersabar, system sedang mengolah data yang telah Anda update",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes

      let response = await fetch("/here/editData", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let resultText = await response.text();

      let result;
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        await Swal.fire({
          title: "Response",
          text: resultText,
          icon: "info",
          confirmButtonText: "OK",
        });
        return;
      }

      let responseMessage = result.message
        ? result.message
        : Object.values(result).join("\n");

      Swal.fire({
        title: "Success!",
        text: responseMessage,
        icon: "success",
        timer: 5000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error:", error);
      let errorMessage =
        error.name === "AbortError"
          ? "Request timed out! Please try again."
          : error.message || "Failed to save data. Please try again.";

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  }
}

// Function to preview images
async function previewImage(event, id) {
  let input = event.target;
  let preview = document.getElementById(`preview-${id}`);

  if (input.files && input.files[0]) {
    let reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("d-none");
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    preview.src = "";
    preview.classList.add("d-none");
  }
}

// ### 02 - 06 - 2025
function showImageModal(imgSrc, title) {
  Swal.fire({
    title: `
				<div class="d-flex justify-content-between align-items-center">
					<span class="fw-semibold">${title}</span>
					<div>
						<button onclick="zoomImage(1.25)" type="button" class="btn btn-sm btn-primary me-1">+</button>
						<button onclick="zoomImage(0.8)" type="button" class="btn btn-sm btn-secondary">−</button>
					</div>
				</div>
			`,
    html: `
				<div class="text-center overflow-auto">
					<img id="zoomable-img" src="${imgSrc}" alt="${title}"
						class="img-fluid"
						style="transition: transform 0.3s ease; max-height: 80vh;" />
				</div>
			`,
    showConfirmButton: false,
    showCloseButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    width: "auto",
    customClass: {
      popup: "border-0 shadow rounded",
    },
  });
  window.currentZoom = 1;
}

function zoomImage(factor) {
  const img = document.getElementById("zoomable-img");
  window.currentZoom = (window.currentZoom || 1) * factor;
  window.currentZoom = Math.min(Math.max(window.currentZoom, 0.5), 5);
  img.style.transform = "scale(" + window.currentZoom + ")";
}

function editFeedback(el, tabel, idTask, woNumber, endpoint) {
  // Close any open Bootstrap modals
  document.querySelectorAll(".modal.show").forEach((modalEl) => {
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
      modalInstance.hide();
    } else {
      modalEl.classList.remove("show");
      modalEl.style.display = "none";
      document.body.classList.remove("modal-open");
      document.querySelector(".modal-backdrop")?.remove();
    }
  });

  Swal.close();

  const currentVal = el.getAttribute("data-value") || "";

  setTimeout(() => {
    Swal.fire({
      title: `<span class="badge bg-label-secondary" style="font-size: 0.75rem; vertical-align: middle;">${idTask}</span> Feedback untuk WO Number: ${woNumber}`,
      input: "textarea",
      inputLabel: "Masukkan feedback",
      inputValue: currentVal,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "rounded",
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-secondary ms-2",
      },
      buttonsStyling: false,
      preConfirm: (newVal) => {
        newVal = newVal.trim();

        if (!newVal) {
          Swal.showValidationMessage("Feedback tidak boleh kosong.");
          return false;
        }

        Swal.showLoading();

        return new Promise((resolve, reject) => {
          $.ajax({
            url: endpoint,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              tabel: tabel,
              id_task: idTask,
              wo_number: woNumber,
              feedback: newVal,
            }),
            success: function (res) {
              // Update textarea value and data attribute
              el.value = newVal;
              el.setAttribute("data-value", newVal);

              // Optional: dynamically resize height
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";

              resolve(res);
            },
            error: function (xhr) {
              let msg = "Terjadi kesalahan: " + xhr.responseText;
              try {
                const res = JSON.parse(xhr.responseText);
                msg = res.message || msg;
              } catch (e) {}

              Swal.hideLoading();
              Swal.showValidationMessage(msg);
              reject();
            },
          });
        });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const message = result.value?.message || "Feedback berhasil disimpan";

        // Reload the DataTable that contains el
        const $table = $("table.dt_teknisi_pengerjaan_" + tabel);
        if ($table.length) {
          const dtInstance = $table.DataTable();
          if (dtInstance) {
            dtInstance.ajax.reload(null, false);
          }
        }

        Swal.fire({
          icon: "success",
          title: message,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }, 200);
}

function openPopupPhotos(id, table) {
  // Photos
  window.open(
    "/photos/" + id + "?table=" + table,
    "popupWindowRight",
    "width=400,height=700,top=20,left=" +
      (window.screen.width - 420) +
      ",scrollbars=yes,resizable=yes"
  );

  // Additional data
  window.open(
    "/ta_additional_data/" + id,
    "popupWindowLeft",
    "width=400,height=700,top=20,left=20,scrollbars=yes,resizable=yes"
  );
}
