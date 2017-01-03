/**
 * The purpose of {@link Spectrum} is used to add color to other plugin objects
 *
 * @class Spectrum
 * @extends EkstepEditor.basePlugin
 *
 * @author Chetan Sachdev <chetan.sachdev@tarento.com>
 */
EkstepEditor.basePlugin.extend({
    /**
     * This expains the type of the plugin 
     * @member {String} type
     * @memberof Spectrum
     */
    type: "spectrum",
    /**
     * This contains the life cycle  methods of colorpicker
     * @member {undefined|Array} picker
     * @memberof Spectrum
     */
    picker: [],
    
    initialize: function() {
        EkstepEditorAPI.addEventListener("colorpicker:state", this.invoke, this);
        EkstepEditorAPI.addEventListener("colorpicker:update", this.updateColor, this);
    },
    /**
     * The method is used to initiate the colorpicker
     * it has the callback method which will be called on change of the color
     * @param  {Object} event
     * @param  {Object} data
     * @memberof Spectrum 
     */
    invoke: function(event, data) {
        var instance = this;
        if (EkstepEditorAPI.jQuery("#" + data.id).attr("colorpicker") != "added") {
           
           this.picker[data.id] = EkstepEditorAPI.jQuery("#" +data.id).spectrum({
                color: "#FF0000",
                showInput: true,
                showAlpha: true,
                preferredFormat: "hex",
                showButtons: false,
                containerClassName: 'awesome',
                clickoutFiresChange: false,
                change: function(color) { 
                    data.callback(data.id, color.toHexString());
                },
                showPaletteOnly: true,
                togglePaletteOnly: true,
                togglePaletteMoreText: 'more',
                togglePaletteLessText: 'less',
                color: 'blanchedalmond',
                palette: [
                    ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
                    ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
                    ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
                    ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
                    ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
                    ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
                    ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
                    ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
                ],
                maxSelectionSize: 10,
                hideAfterPaletteSelect:true,
                // move: function(tinycolor) { 
                //     data.callback(data.id, tinycolor.toHexString());
                // },
            });

            EkstepEditorAPI.jQuery("#" + data.id).attr("colorpicker", "added");
        }
        if (data && data.color) {
            //this.picker[data.id].fromString(data.color);
             EkstepEditorAPI.jQuery("#" + data.id).spectrum("set", data.color);
        } else {
            //this.picker[data.id].fromString("#000000"); // default color will be black
             EkstepEditorAPI.jQuery("#" + data.id).spectrum("set", "#000000");// default color will be black
        }
    }
});
//# sourceURL=spectrumplugin.js