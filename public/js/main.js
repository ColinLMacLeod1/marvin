$(document).ready(function () {
    var windowSize = $(window).height();
    $('.page').height($(window).height());
    
    $(window).resize(function(){
        windowSize = $(window).height();
    });

    $('#descClick').click(function () {
       $("html, body").animate({ scrollTop: windowSize*0.75});
    });
    
    $('#arrowClick').click(function () {
       $("html, body").animate({ scrollTop: windowSize*0.75 });
    });
    
    $('#finished').click(function () {
       $("html, body").animate({ scrollTop:0});
    });
});