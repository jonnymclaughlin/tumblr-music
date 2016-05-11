// http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=06dde6bc9ad59c67cd629a2831aebebc&artist=cher&track=believe&format=json

/**
 *  Last.fm Model
 *      - gets track info
 */

var TumblrMusic = TumblrMusic || {};

(function($, _, Backbone, exports) {
    
    var LastfmModel = Backbone.Model.extend({

        url: 'http://ws.audioscrobbler.com/2.0/',

        // Defaults
        defaults: {
        	apiKey: '8dbe72c2e9ac59dcb06571e04ea9b132',
        },
        
        // Initialize
        initialize: function(options) {
            // options
            this.options = _.extend({}, this.defaults, options);
        },

        // Fetch
        fetch: function(artist) {
            if(!artist) return;

            // defaults
            var data = {
                api_key: this.options.apiKey,
                artist: artist,
                format: 'json',
                method: 'artist.getInfo'
            };

            // outgoing data
            var outgoing = {
                dataType: 'jsonp', 
                data: data
            };

            return Backbone.Model.prototype.fetch.call(this, outgoing);
        },

        // Parse
        parse: function(response) {
        	if(!response.artist) return;

            this.set(response.artist);
        }

    });

    exports.LastfmModel = LastfmModel;
    
})(jQuery, _, Backbone, TumblrMusic);