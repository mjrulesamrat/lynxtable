/* JavaScript for LynxTable XBlock, Studio Side. */
function LynxTableXBlockStudio(runtime, xblock_element) {

    var isFullscreen = false;
    var sHeight = 0;
    var sWidth = "70%";
    var sTop = "15.5%";
    var sLeft = "15%";
    var csxColor = ["#009FE6", "black"];

    // Manually set this to where you store CKEditor
    var CKEditor_URL = "{{ CKEDITOR_URL }}";

    var codemirror_settings = {
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        theme: "mdn-like"
    };

    var studio_buttons = {
        "chx_tab_options": "Options",
        "chx_tab_html": "HTML",
        "chx_fullscreen": "Max"
    };

    var ckeditor_html = "";
    var editor_html = "";
    var ckeditor_html_flag = true;

    // Attach CKEditor to HTML input textarea
    if (CKEditor_URL.endsWith("ckeditor.js")) {
        $.getScript(CKEditor_URL, function () {
            ckeditor_html = CKEDITOR.replace('chx_body_html');
            ckeditor_html.config.height = "auto";
            ckeditor_html.config.width = "auto";
	    ckeditor_html.config.extraPlugins = "format";
            ckeditor_html.config.format_tags = "p;h1;h2;h3;h4;h5;h6;pre;address;div";
            ckeditor_html.config.baseHref = "http://148.251.101.130:8001/";
	    ckeditor_html.config.resize_enabled = true;
        });
    }
    else{
        ckeditor_html_flag = false;
    }

    // Use CodeMirror as a fallback
    if (!ckeditor_html_flag) {
        console.log("Code mirror loaded");
        editor_html = CodeMirror.fromTextArea($('.chx_body_html')[0],
            jQuery.extend({mode: {name: "htmlmixed", globalVars: true}}, codemirror_settings)
        );
    }


    // Adjust Editor dialog to fit the entire window
    function xblock_maximize() {

        var h = 0.83 * $(window).height();

        $('.modal-window').css({"top": "0px", "left": "0px", "width": "100%"});
        $('.modal-content').css({"height": 0.865 * $(window).height()});
        if (ckeditor_html != "") ckeditor_html.resize("100%", h);
        if (editor_html != "") editor_html.setSize("100%", h);
        $('#chx_fullscreen').css({"color": csxColor[1]});

        isFullscreen = true;
    }

    // Adjust Editor dialog to edX's standard settings
    function xblock_minimize() {

        var h = 0.55 * $(window).height();

        $('.modal-window').css({"top": sTop, "left": sLeft, "width": sWidth});
        $('.modal-content').css({"height": 0.6 * $(window).height()});
        if (ckeditor_html != "") ckeditor_html.resize("100%", h);
        if (editor_html != "") editor_html.setSize("100%", h);
        $('#chx_fullscreen').css({"color": csxColor[0]});

        isFullscreen = false;

    }

    // Refresh Editor dimensions
    function xblock_refresh() {
        if (isFullscreen) xblock_maximize();
        else xblock_minimize();
    }

    function tab_highlight(toHighlight) {
        for (var b in studio_buttons) {
            if (b != "chx_fullscreen") $("#" + b).css({"color": csxColor[0]});
        }
        $("#" + toHighlight).css({"color": csxColor[1]});
    }

    // Hide all panes except toShow
    function tab_switch(toShow) {
        tab_highlight(toShow);
        for (var b in studio_buttons) $("." + b).hide();
        $("." + toShow).show();
        xblock_refresh();
    }

    // Send current code and settings to the backend
    function studio_submit(commit) {

        commit = commit === undefined ? false : commit;

        $.ajax({
            type: "POST",
            url: runtime.handlerUrl(xblock_element, 'studio_submit'),
            data: JSON.stringify({
                "commit": commit.toString(),
                "display_name": $('.chx_display_name').val(),
                "body_html":
                    (ckeditor_html != "") ?
                        ckeditor_html.getData() :
                        editor_html.getDoc().getValue(),
            }) // add success state that appends preview to the DOM
        });

    }

    $(function($) {

        // Add Save Button
        $('ul', '.modal-actions')
            .append(
                $('<li>', {class: "action-item"}).append(
                    $('<a />', {class: "action-primary", id: "chx_submit", text: "Save"})
                )
            );

        for (var b in studio_buttons) {
            $('.editor-modes')
                .append(
                    $('<li>', {class: "action-item"}).append(
                        $('<a />', {class: "action-primary", id: b, text: studio_buttons[b]})
                    )
                );
        }

        // Set main pane to Options
        tab_switch("chx_tab_options");
        // Adjust the modal window
        xblock_minimize();
        // Readjust modal window dimensions in case the browser window is resized
        window.addEventListener('resize', function() {
            xblock_refresh()
        });

        $('#chx_tab_options').click(function() {
            tab_switch("chx_tab_options");
        });

        $('#chx_tab_html').click(function() {
            tab_switch("chx_tab_html");
        });

        // Fill the window with the Editor view
        $('#chx_fullscreen').click(function() {
            isFullscreen = !isFullscreen;
            xblock_refresh();
        });

        // Clicked Save button
        $('#chx_submit').click(function(eventObject) {
            studio_submit(true);
            setTimeout(function(){location.reload();},200);
        });

    });

}
