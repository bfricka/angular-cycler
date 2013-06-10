angular
  .module('cycler', [])
  .controller('CyclerCtrl', [
    '$scope', '$timeout', function($scope, $timeout) {
      var self = this
        , slides = self.slides = []
        , isPaused = false
        , isCycling = false
        , currentIdx = -1
        , currentTimeout = null;

      $scope.direction = 'next';
      $scope.transitionIn = $scope.transitionIn || 'fade';
      $scope.transitionOut = $scope.transitionOut || 'fade';

      var totalSlides = $scope.totalSlides = function() {
        return slides.length;
      };

      this.setActive = function(idx) {
        var i = 0
          , len = slides.length;

        // Get index if we pass a slide model
        if (!angular.isNumber(idx)) idx = slides.indexOf(idx);

        currentIdx = idx;

        while (i < len) {
          slides[i].active = false;
          i++;
        }

        slides[idx].active = true;
      };

      this.addSlide = function(slide) {
        var numSlides = totalSlides();

        slides.push(slide);

        if (numSlides === 1 || slide.active) {
          self.setActive(numSlides - 1);
          if (numSlides === 1) $scope.play();
        } else {
          slide.active = false;
        }
      };

      this.removeSlide = function(slide) {
        var idx = slides.indexOf(slide);

        slides.splice(idx, 1);

        var numSlides = totalSlides();

        if (numSlides > 0 && slide.active) {
          var activeIdx = (idx >= numSlides) ? idx - 1 : idx;
          self.setActive(activeIdx);
        }
      };

      $scope.slides = function() {
        return slides;
      };

      $scope.isActive = function(slide) {
        return slide.active;
      };

      $scope.togglePlay = function() {
        return isPaused = !isPaused;
      };

      $scope.play = function() {
        if (!isCycling && !isPaused) {
          isCycling = true;
          restartTimer();
        }
      };

      $scope.pause = function() {
        if (!isPaused) {
          isCycling = false;
          cancelTimeout();
        }
      };

      $scope.next = function() {
        currentIdx = (currentIdx + 1) % slides.length;
        $scope.direction = 'next';
        self.setActive(currentIdx);
      };

      $scope.prev = function() {
        currentIdx = currentIdx - 1 < 0 ? slides.length - 1 : currentIdx - 1;
        $scope.direction = 'prev';
        self.setActive(currentIdx);
      };

      $scope.$watch('interval', restartTimer);
      $scope.$watch('transitionIn+transitionOut+direction', updateTransition);

      function updateTransition() {
        self.show = "'" + $scope.transitionIn + "-show-" + $scope.direction + "'";
        self.hide = "'" + $scope.transitionOut + "-hide-" + $scope.direction + "'";
      }

      function cancelTimeout() {
        if (currentTimeout) {
          return $timeout.cancel(currentTimeout);
        }
      }

      function restartTimer() {
        var interval = +$scope.interval;

        cancelTimeout();

        if (!isNaN(interval) && interval >= 0) {
          currentTimeout = $timeout(play, interval);
        }

        function play() {
          if (isCycling) {
            $scope.next();
            restartTimer();
          }
        }
      }
    }
  ])

  .directive('cycler', function() {
    return {
        replace     : true
      , restrict    : 'EA'
      , transclude  : true
      , controller  : 'CyclerCtrl'
      , templateUrl : 'cycler.html'

      , scope: {
          size          : '='
        , controls      : '='
        , interval      : '='
        , direction     : '='
        , indicators    : '='
        , transitionIn  : '='
        , transitionOut : '='
      }

      , link: function(scope, elem, attrs, CyclerCtrl) {
        var sizes = ['xl', 'l', 'm', 's'];

        scope.$watch('size', function(size) {
          scope.size = size = size || 'xl';

          if (sizes.indexOf(size) === -1) {
            elem.removeClass();
            elem.addClass("" + size + " cycler");
          }
        });
      }
    };
  })

  .directive('slide', [
    '$animator', function($animator) {
      return {
          replace     : true
        , require     : '^cycler'
        , restrict    : 'EA'
        , transclude  : true
        , templateUrl : 'slide.html'

        , scope: { active: '=' }

        , link: function(scope, elem, attrs, CyclerCtrl) {
          var animator = null, setupAnimator;
          CyclerCtrl.addSlide(scope, elem);

          scope.$watch(function() { return CyclerCtrl.show; }, setupAnimator);
          scope.$watch(function() { return CyclerCtrl.hide; }, setupAnimator);

          setupAnimator();

          scope.$on('$destroy', function() {
            CyclerCtrl.removeSlide(scope);
          });

          scope.$watch('active', function(active) {
            if (active) {
              CyclerCtrl.setActive(scope);
              animator.show(elem);
            } else {
              animator.hide(elem);
            }
          });

          function setupAnimator() {
            var attr = { ngAnimate: "{show:"+CyclerCtrl.show+",hide:"+CyclerCtrl.hide+"}" };
            animator = $animator(scope, attr);
          }
        }
      };
    }
  ]);
