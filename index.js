const navigation = document.querySelector(".primary-navigation");
      
const navigationHeight = navigation.offsetHeight;

document.documentElement.style.setProperty(
  "--scroll-padding",
  navigationHeight + "px"
);
$('.navbar-collapse a').click(function(){
      $(".navbar-collapse").collapse('hide');
  });
  $(window).scroll(function(){
if ($(this).scrollTop() > 50) {
 $('.vv').addClass('vv2 shadow-sm');
} else {
 $('.vv').removeClass('vv2 shadow-sm');
}
});
/* Code for changing active
      link on clicking */
      var btns =
          $(".navbar-nav .nav-link");

      for (var i = 0; i < btns.length; i++) {
          btns[i].addEventListener("click",
                              function () {
              var current = document
                  .getElementsByClassName("active");

              current[0].className = current[0]
                  .className.replace(" active", "");

              this.className += " active";
          });
      }

      /* Code for changing active
      link on Scrolling */
      $(window).scroll(function () {
          var distance = $(window).scrollTop();
          $('.page-section').each(function (i) {

              if ($(this).position().top
                  <= distance + 250) {
                  
                      $('a.nav-link.active')
                          .removeClass('active');

                      $('a.nav-link').eq(i)
                          .addClass('active');
              }
          });
      }).scroll();

$('.testimonials').owlCarousel({
loop:false,
margin:20,
nav:false,
dots:true,
responsive:{
  0:{
      items:1
  }
}
});

document.getElementById('download-resume').addEventListener('click', function() {

    const downloadLink = document.createElement('a');
    downloadLink.href = 'Resume.docx';
    downloadLink.download = 'Resume.docx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    emailjs.sendForm('service_2fz2qgd', 'template_z3idx7n', this)
        .then(function() {
            console.log('SUCSESS!');
            alert("Your message has been sent successfully");
        }, function(error) {
            console.log('FAILED....', error);
            alert('There was an error sending your message, Please email rawadalh233@gmail.com');
        });
});