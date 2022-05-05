$(document).ready(function () {
  try {
    // intialize config variables
    let zipLevel = "";

    let baseUrlSection = "/us-en/active-iq-unified-manager-910/pdfs/";
    const flavor = $("body").data("flavor");
    if (flavor) {
      baseUrlSection += flavor + "/";
    }
    baseUrlSection += "sidebar/";

    let zipFilename = "";
    let zipFileSize = 0;
    zipLevel = zipLevel !== ""?zipLevel:1;
    zipFilename = zipFilename !== ''?zipFilename:"active-iq-unified-manager-910.zip";
    
    // remove container class from pdf tree not having any sub child
    $("#toggleContainerPdf li.pdf-ux-container").not(".active").removeClass("pdf-ux-container");
    // scroll the mysidebar to the current active link
    $(".sidebar-nav-container").scrollTop(($(".sidebar-nav-container>#mysidebar  li.active:last").offset().top) - ($(".sidebar-nav-container").offset().top + 100));
    const pdfUrls = getPdfUrls(zipLevel, baseUrlSection);
    if(pdfUrls.length > 0) {
      zipPdf();
    }

    // get pdf urls for a specific level
    function getPdfUrls(zipLevel, baseUrlSection){
      const pdfUrls = [];
      let entryQuery = ">li"
      for(let i=1; i<zipLevel; i++) {
        entryQuery = entryQuery + ">" + "ul>li";
      }

      let sidebarLinks = document.querySelectorAll(".ie-main>.col-md-3 ul#mysidebar"+entryQuery);
      sidebarLinks.forEach(li => {
        if(li.children.length <= 1 || li.querySelector('ul').children.length < 1) return;
        const pdfName = li.querySelector('a').textContent.trim().replace(/\s|\-|\,|\(|\)|\[|\]|\;|\'|\.|\:/g, "_") + '.pdf';
        pdfUrls.push(baseUrlSection+pdfName);
      });

      return pdfUrls;
    }

    // zip all pdf files
    function zipPdf(){
      let zip = new JSZip();
      let count = 0;
      // disable link and start spinner
      if(zipFileSize != 0) {
        $("#zip-link-popup").removeClass("hide");
      }

      pdfUrls.forEach(function(url){
        let filename = url.substring(url.lastIndexOf('/')+1);
        // loading a file and add it in a zip file
        JSZipUtils.getBinaryContent(url, function (err, data) {
          if(err) {
            count++;
            console.error("Failed to load PDF: " + err.message);
          } else {
            count++;
            zip.file(filename, data, {binary:true});
            if (count == pdfUrls.length) {
              zip.generateAsync({type:'blob'}).then(function(content) {
                if(zipFileSize == 0) {
                  zipFileSize = (content.size/1000000).toFixed();
                  $('#zipPdf .zip-size').text('['+zipFileSize+'MB]');
                }
                else {
                  if(!$("#zip-link-popup").hasClass("hide")) {
                    saveAs(content, zipFilename);
                    // enable link and stop spinner
                    $("#zip-link-popup .downloading-progress").addClass("hide");
                    $("#zip-link-popup .download-complete").removeClass("hide");
                    setTimeout(function(){
                      $("#zip-link-popup").addClass("hide");
                      $("#zip-link-popup .downloading-progress").removeClass("hide");
                      $("#zip-link-popup .download-complete").addClass("hide");
                    },2000);
                  }
                }
              });
            }
          }
        });
      });
    }

    // bind zipPdf link click
    $("#zipPdf").click(function(event){
      event.preventDefault();
      zipPdf();
      event.stopImmediatePropagation();
    });
  } catch (err) {
    console.log(err.message);
    // enable link and stop spinner
    $("#zip-link-popup").addClass("hide");
  }
});
