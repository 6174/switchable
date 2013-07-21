/*
combined files : 

gallery/switchable/1.0/index

*/
/**
 * @fileoverview 
 * @author xuejia.cxj<570171025@qq.com>
 * @module switchable
 **/
KISSY.add('gallery/switchable/1.0/index',function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class Switchable
     * @constructor
     * @extends Base
     */
    function Switchable(comConfig) {
        var self = this;
        //调用父类构造函数
        Switchable.superclass.constructor.call(self, comConfig);
    }
    S.extend(Switchable, Base, /** @lends Switchable.prototype*/{

    }, {ATTRS : /** @lends Switchable*/{

    }});
    return Switchable;
}, {requires:['node', 'base']});




