/**
 *  globals jQuery, Backbone, _
 *  
 *  Tumblr Music
 *      - listen to Tumblr user's audio posts
 */

var TumblrMusic = TumblrMusic || {};

(function($, exports) {

    var Main = Backbone.View.extend({

        // Track Select Event
        __trackSelect: function(trackData) {
            if(this.trackView) {
                this.trackView.remove();
                this.trackView = null;
            }

            this.trackView = new exports.TrackView({
                model: this.model,
                trackData: trackData
            }).render();
        },

        // Initialize
        initialize: function() {

            // elements
            this.$body = $('body');

            // models
            this.model = new exports.TumblrModel();

            // views
            this.trackView = null;
            this.indexView = new exports.IndexView({
                model: this.model
            });

            // events
            this.listenTo(this.indexView, 'track:select', this.__trackSelect);

            // setup
            this.$body.removeClass('no-js');
        }

    });

    exports.Main = Main;
    
})(jQuery, TumblrMusic);


$(function() {
    var Main = new TumblrMusic.Main();
});