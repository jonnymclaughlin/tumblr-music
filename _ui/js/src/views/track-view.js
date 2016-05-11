/**
 *  Track View
 *      - controls now playing track
 */

var TumblrMusic = TumblrMusic || {};

(function($, _, Backbone, exports) {
    
    var TrackView = Backbone.View.extend({

        id: 'now-playing',
        tagName: 'section',
        
        // Defaults
        defaults: {
            trackData: {},
            transitionDuration: 800
        },

        // Events
        events: {
            'click .pause.control': '__pauseClick' ,
            'click .skip.control': '__skipClick',
            'click .shuffle.control': '__shuffleClick',
            'click .index.control': '__indexClick'
        },

        // Pause Click Event
        __pauseClick: function(e) {
            e.preventDefault();

            if($(e.currentTarget).hasClass('paused')) {
                this._play();
            } else {
                this._pause();
            }
        },

        // Skip Click Event
        __skipClick: function(e) {
            e.preventDefault();
            this._next();
        },

        // Shuffle Click Event
        __shuffleClick: function(e) {
            e.preventDefault();

            var $target = $(e.currentTarget);
            $target.toggleClass('on');
            this.isShuffle = $target.hasClass('on');
        },

        // Index Click Event
        __indexClick: function(e) {
            e.preventDefault();
            this._stop();
        },

        // Window Post Message Event
        __windowMessage: function(e) {
            if(!e.originalEvent || !e.originalEvent.data) return;

            var msg = e.originalEvent.data.split(";")[0];
            switch(msg){
                case "audioPlayerReady":
                    break;
                case "audioPlayerPlaying":
                    this.isPlaying = true;
                    this.$pauseButton.removeClass('paused');
                    break;
                case "audioPlayerPause":
                    this.isPlaying = false;
                    this.$pauseButton.addClass('paused');
                    break;
                case "audioPlayerEnded":
                    this.isPlaying = false;
                    this._next();
                    break;
            }
        },

        // Window Keydown
        __windowKeydown: function(e) {
            switch(e.which) {
                case 32: // spacebar
                    this._togglePlayPause();
                    break;
                case 39: // right arrow
                    this._next();
                    break;
                case 27: // esc
                case 73: // i
                    this._stop();
                    break;
            }
        },

        // Audio Play Event
        __audioPlaying: function() {
            this.isPlaying = true;
            this.$pauseButton.removeClass('paused');
        },

        // Audio Pause Event
        __audioPause: function() {
            this.isPlaying = false;
            this.$pauseButton.addClass('paused');
        },

        // Audio Ended Event
        __audioEnded: function() {
            this.isPlaying = false;
            this._next();
        },


        // Tumblr Audio Play
        _tumblrAudioPlay: function() {
            if(!this.$tumblrPlayer.length) return;

            this.$tumblrPlayer.get(0).contentWindow.postMessage('play', '*');
        },

        // Tumblr Audio Pause
        _tumblrAudioPause: function() {
            if(!this.$tumblrPlayer.length) return;

            this.$tumblrPlayer.get(0).contentWindow.postMessage('pause', '*');
        },

        // Ready
        _ready: function() {
            this.$el.addClass('ready');

            // render post
            this.renderPost(this.currentIndex);

            this.$('.background').append(this.backgroundView.render().el);
        },

        // Pause
        _pause: function() {
            if(this.isTumblrPost) {
                this._tumblrAudioPause();
            } else {
                this.audioPlayer.pause();
            }

            if(this.backgroundView) {
                this.backgroundView.pause();
            }
        },

        // Play
        _play: function() {
            if(this.isTumblrPost) {
                this._tumblrAudioPlay();
            } else {
                this.audioPlayer.play();
            }

            if(this.backgroundView) {
                this.backgroundView.play();
            }
        },

        // Toggle Play/Pause
        _togglePlayPause: function() {
            if(this.isPlaying) {
                this._pause();
            } else {
                this._play();
            }
        },

        // Next
        _next: function() {
            this.renderPost(this.currentIndex + 1);
        },

        // Stop
        _stop: function() {
            this.$el.removeClass('ready');

            var duration = 400;

            // fade out music
            if(this.$audioPlayer.length) {
                this.$audioPlayer.animate({
                    volume: 0
                }, duration);
            }

            // remove view
            _.delay(_.bind(this.remove, this), duration);
        },

        // Cache Selectors
        _cacheSelectors: function() {
            this.$loader = this.$('.loader');
            this.$nowPlaying = this.$('.now-playing-track');
            this.$currentTrack = this.$('.current-track');
            this.$pauseButton = this.$('.control.pause');
            this.$avatar = this.$('.avatar');
        },

        
        // Initialize
        initialize: function(options) {
            // options
            this.options = _.extend({}, this.defaults, options);

            // vars
            this.trackData = this.options.trackData;
            this.currentPost = {};
            this.currentIndex = this.trackData.trackIndex;
            this.isTumblrPost = false;
            this.isShuffle = false;
            this.isPlaying = false;

            // elements
            this.$win = $(window);
            this.$loader = $();
            this.$nowPlaying = $();
            this.$tumblrPlayer = $();
            this.$pauseButton = $();
            this.$avatar = $();

            // audio player
            this.audioPlayer = new Audio();
            this.audioPlayer.autoplay = false;
            this.audioPlayer.preload = true;
            this.$audioPlayer = $(this.audioPlayer);

            // views
            this.backgroundView = new exports.BackgroundView();

            // template
            this.template = _.template($('#track-template').html());
            this.nowPlayingTemplate = _.template($('#now-playing-template').html());

            // events
            this.$win.on('message.track-view', _.bind(this.__windowMessage, this));
            this.$win.on('keydown.track-view', _.bind(this.__windowKeydown, this));
            this.$audioPlayer.on('playing', _.bind(this.__audioPlaying, this));
            this.$audioPlayer.on('pause', _.bind(this.__audioPause, this));
            this.$audioPlayer.on('ended', _.bind(this.__audioEnded, this));

            // elements
            this.$container = $('#container');
        },

        // Render
        render: function() {
            var $trackItem = $(this.trackData.trackEl);
            var trackOffset = $trackItem.offset();

            this.$el.html(this.template({
                album_art: this.trackData.trackAlbumArt,
                blog: this.model.get('blog'),
                preview: {
                    left: trackOffset.left,
                    top: trackOffset.top,
                    height: $trackItem.height(),
                    width: $trackItem.width()
                },
                post: this.model.getPost(this.trackData.trackIndex)
            }));

            this.$container.append(this.$el);

            this._cacheSelectors();

            _.delay(_.bind(this._ready, this), 100);

            return this;
        },

        // Render Post
        renderPost: function(index) {
            var post = this.model.getPost(index);

            if(_.isEmpty(post)) return;

            if(this.audioPlayer) {
                this.audioPlayer.pause();
                this.audioPlayer.src = '';
            }

            this.currentPost = post;
            this.currentIndex = index;
            this.isTumblrPost = post.audio_type === 'tumblr';
            this.$currentTrack.html(this.nowPlayingTemplate(post));
            this.$tumblrPlayer = this.$currentTrack.find('.tumblr_audio_player');
            this.$avatar.attr('href', post.post_url);

            if(!this.isTumblrPost) {
                this.audioPlayer.src = post.audio_url;
            }

            // play
            _.delay(_.bind(function() {
                this._play();
                this.backgroundView.updateArtist(post.artist);
                
            }, this), this.options.transitionDuration);
        },

        // Remove
        remove: function() {
            this.$win.off('.track-view');
            this.$audioPlayer.off();

            if(this.audioPlayer) {
                this.audioPlayer.pause();
                this.audioPlayer.src = '';
            }

            return Backbone.View.prototype.remove.call(this);
        }

    });

    exports.TrackView = TrackView;
    
})(jQuery, _, Backbone, TumblrMusic);