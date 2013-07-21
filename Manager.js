 /**
 * @ Intervel worker Manager
 */
(function() {
    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }

    var Event = {
        bind: function(ev, callback) {
            var evs = ev.split(" ");
            var calls = this._callbacks || (this._callbacks = {});
            for (var i = 0; i < evs.length; i++)
                (this._callbacks[evs[i]] || (this._callbacks[evs[i]] = [])).push(callback);
            return this;
        },
        trigger: function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var ev = args.shift();
            var list, calls, i, l;
            if (!(calls = this._callbacks)) return this;
            if (!(list = this._callbacks[ev])) return this;
            for (i = 0, l = list.length; i < l; i++) {
                list[i].apply(this, args);
            }
            return this;
        },
        remove: function(ev) {
            if (!this._callbacks) return this;
            if (!this._callbacks[ev]) return this;
            this._callbacks[ev] = [];
        },
        unbind: function(ev, callback) {
            if (!ev) {
                this._callbacks = {};
                return this;
            }
            var list, calls, i, l;
            if (!(calls = this._callbacks)) return this;
            if (!(list = this._callbacks[ev])) return this;

            for (i = 0, l = list.length; i < l; i++) {
                if (callback === list[i]) {
                    list.splice(i, 1);
                    break;
                }
            }
            return this;
        }
    };

    /**
     * @method getObjKeys
     * @param  {Object}
     * @return {Array}--keys
     */

    function getObjKeys(obj) {
        var keys = [];
        for (attr in obj)
            if (obj.hasOwnProperty(attr)) {
                keys.push(attr);
            }
        return keys;
    }

    /**
     * @method sampledArr
     */

    function sampledArr(Arr, size) {
        if (!Arr instanceof Array) return [];
        var len = Arr.length;
        var size = Math.min(len, size);
        var sampledCount = 0;
        var ret = [];
        var it;

        //judge if item is in ret array

        function inRet(it) {
            if (!it) return false;
            var i;
            var l = ret.length;
            // Can't use hashmap to test, because  of ie 6 has no JSON
            for (i = 0; i < l; i++) {
                if (ret[i] === it) {
                    return true;
                }
            }
            return false;
        }

        //get a random item from Arr

        function getRandomIt() {
            var i = (Math.random() * len - 0.001) << 0;
            return Arr[i];
        }

        while (sampledCount < size) {
            it = getRandomIt();
            if (!inRet(it)) {
                sampledCount += 1;
                ret.push(it);
            }
        }
        return ret;
    }
    // var testArr = [1, 2, 3, 4, 5, 6]
    // console.log(sampledArr(testArr, 8));

    function Manager(conf) {
        var self = this;
        if (!self instanceof Manager) {
            return new Manager(arguments);
        }
        self.parent = Manager;
        //event center for manager
        for (attr in Event) {
            self[attr] = Event[attr];
        }
        /**
         * @Attr {Object}
         * @DESC    the workers collection
         *          guid -- worker pairs
         */
        self.workers = {};

        /**
         *
         * @attr {Object}
         */
        self.conf = {
            stratergy: "random", //random-inviewport, inViewPort, all, 
            maxworker: 100,
            workerClass: {
                //the js class of worker
                klass: null,
                //static dom containers for rerender
                staticDomContainers: [],
                //the css classfier for worker's dom
                params: null
            },
        };

        //config function
        self.config = function(confs) {
            var self = this;
            for (attr in confs) {
                self.conf[attr] = confs[attr];
            }
            return self;
        };
        self.config(conf);

        self.addWorker = function(workerInstance) {
            var self = this;
            var worker = self.makeWorker(workerInstance);
            self.workers[worker.id] = worker;
            return self;
        }

        self.removeWorker = function(id) {
            var self = this;
            delete self.workers[""];
            return self;
        }

        self._generateWorkQueue = function() {
            var self = this;
            var workerRange = self.conf.workerRange || [2, 4];
            var workTimeRange = self.conf.workTimeRange || [1, 3];
            var self = this;
            var keys = getObjKeys(self.workers);
            var workerQueue = [];
            var workerNeeded = Math.floor((Math.random() * workerRange[0] + (workerRange[1] - workerRange[0])));
            var neededWorkers = sampledArr(keys, workerNeeded);
            var i;
            for (i = 0; i < workerNeeded; i++) {
                workerQueue.push([
                    neededWorkers[i],
                    Math.random() * workTimeRange[0] + workTimeRange[1] - workTimeRange[0],
                    0
                ]);
            }
            self.workerQueue = workerQueue;
            self.jobFinished = 0;
            console.log(workerQueue);
            return workerQueue;
        }

        self.hasJob = function() {
            var workerQueue = self.workerQueue;
            var i;
            var job;
            for (i = 0; i < l; i++) {
                job = workerQueue[i];
                if (job[1] != job[3]) return true;
            }
            return false;
        }

        //bind finish One Round event
        self.bind("finishOneRound", function() {
            self._generateWorkQueue();
            console.log("finish a job");
            self.run();
        });

        //bind finish a job
        self.bind("finishedAJob", function() {
            self.jobFinished += 1;
            console.log("finish a job");
            if (self.jobFinished == self.workerQueue.length) {
                self.trigger("finishOneRound");
                self
            }
        });

        //run stratergies
        self.Stratergy = {
            //random with 
            random: function() {
                var workers = self.workers;
                //work queue for every round 
                self._generateWorkQueue();
                var workerQueue = self.workerQueue;
                var i;
                var l;
                var job;
                var woker;
                var runedTimes;
                var timesToRun;

                for (i = 0, l = workerQueue.length; i < l; i++) {
                    job = workerQueue[i];
                    worker = workers[job[0]];
                    timesToRun = job[1];
                    worker.work(timesToRun, self);
                }
            }
        };
        self.reStore = function() {
            var self = this;
            if (self.conf.workerClass.staticDomContainers.length === 0) return;
        }
        /**
         * @DESC set workers by workerClass
         */
        self.init = function() {

        }
        //run
        self.run = function() {
            var self = this;
            var stratergy = self.conf["stratergy"] || "random";
            self.Stratergy[stratergy]();
            return self;
        }

        //stop
        self.stop = function() {

        }
    }
    /**
     * @DESC   makeWorker for manager
     */
    Manager.prototype.makeWorker = function(workerInstance) {
        if (typeof workerInstance.work !== 'function') {
            workerInstance.work = function() {};
        }
        workerInstance.id = guid();
        var timeDelay = workerInstance.timeDelay || 1000;

        workerInstance.work = function(job, manager) {
            var self = this;
            var t;
            self.timesToRun = job[1];

            function func() {
                t = setTimeout(function() {
                    if (self.timesToRun > 0) {
                        self.run();
                        func();
                    } else {
                        manager.trigger("finishedAJob", job);
                        clearTimeout(t);
                    }
                }, timeDelay);
            }
            func();
        }
        return workerInstance;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function Switcher() {
        var self = this;
        self.attr = "haha";
        self.timeDelay = 2000;
        self.run = function() {
            var self = this;
            console.log(self.id || self.attr);
        }
        self.work = function() {
            var self = this;
            setTimeOut(self.run(), self.timeDelay);
        }
    }

    function testManager() {
        var manager = new Manager({
            stratergy: "random"
        });
        for (var i = 0; i < 10; i++) {
            manager.addWorker(new Switcher());
        }
        manager.run();
    }
    testManager();
})();