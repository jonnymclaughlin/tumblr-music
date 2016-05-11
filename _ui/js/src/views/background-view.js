/**
 *  Background View
 *      - cool dance gifs
 */

var TumblrMusic = TumblrMusic || {};

(function($, _, Backbone, exports) {
    
    var BackgroundView = Backbone.View.extend({

        className: 'background-gifs',
        
        // Defaults
        defaults: {
            artist: '',
            delay: 4000,
            track: ''
        },

        // Model Change Event
        __modelChange: function() {
            var tags = this.model.get('tags');

            if(_.isEmpty(tags)) return;

            var tag = tags.tag[0];
            var list = exports.vibes.random;

            if(tag) {
                var tagName = tag.name;
                if(tagName.indexOf('punk') > -1) tagName = 'punk';

                list = exports.vibes[tagName] || exports.vibes.random;
            }

            this.imageList = _.shuffle(list);
            this.renderImage();
        },
        
        // Initialize
        initialize: function(options) {
            // options
            this.options = _.extend({}, this.defaults, options);

            // vars
            this.imageList = exports.vibes.random;
            this.imageTimeout = null;
            this.currentImage = 0;
            this.isPaused = false;

            // model
            this.model = new exports.LastfmModel();

            // events
            this.listenTo(this.model, 'change', this.__modelChange);
        },

        // Pause
        pause: function() {
            if(this.imageTimeout) {
                clearTimeout(this.imageTimeout);
                this.imageTimeout = null;
            }
        },

        // Play
        play: function() {
            this.pause();
            this.imageTimeout = setTimeout(_.bind(this.renderImage, this), this.options.delay);
        },

        // Update Artist
        updateArtist: function(artist) {
            // get track info
            this.model.fetch(artist);
        },

        // Render Image
        renderImage: function() {
            this.pause();

            this.currentImage++;
            if(this.currentImage > this.imageList.length - 1) {
                this.currentImage = 0;
            }

            var url = this.imageList[this.currentImage];
            this.$el.addClass('playing').css('background-image', 'url(' + url + ')');

            this.play();

            return this;
        }

    });

    exports.BackgroundView = BackgroundView;
    
})(jQuery, _, Backbone, TumblrMusic);