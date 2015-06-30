// Generated by CoffeeScript 1.9.1
var cozydb, emit;

cozydb = require('cozydb');

emit = null;

module.exports = {
  settings: {
    all: cozydb.defaultRequests.all
  },
  account: {
    all: cozydb.defaultRequests.all
  },
  contact: {
    all: cozydb.defaultRequests.all,
    mailByName: function(doc) {
      var dp, i, len, ref, results;
      if ((doc.fn != null) && doc.fn.length > 0) {
        emit(doc.fn, doc);
      }
      if (doc.n != null) {
        emit(doc.n.split(';').join(' ').trim(), doc);
      }
      ref = doc.datapoints;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        dp = ref[i];
        if (dp.name === 'email') {
          emit(dp.value, doc);
          results.push(emit(dp.value.split('@')[1], doc));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    mailByEmail: function(doc) {
      var dp, i, len, ref, results;
      ref = doc.datapoints;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        dp = ref[i];
        if (dp.name === 'email') {
          results.push(emit(dp.value, doc));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  },
  mailbox: {
    treeMap: function(doc) {
      return emit([doc.accountID].concat(doc.tree), null);
    }
  },
  message: {
    totalUnreadByAccount: {
      reduce: '_count',
      map: function(doc) {
        if (!doc.ignoreInCount && -1 === doc.flags.indexOf('\\Seen')) {
          return emit(doc.accountID, null);
        }
      }
    },
    byMailboxRequest: {
      reduce: '_count',
      map: function(doc) {
        var boxid, dest, dests, docDate, i, j, k, len, len1, len2, nobox, ref, ref1, ref2, ref3, sender, uid, xflag;
        nobox = true;
        ref = doc.mailboxIDs;
        for (boxid in ref) {
          uid = ref[boxid];
          nobox = false;
          docDate = doc.date || (new Date()).toISOString();
          emit(['uid', boxid, uid], doc.flags);
          emit(['date', boxid, null, docDate], null);
          ref1 = ['\\Seen', '\\Flagged', '\\Answered'];
          for (i = 0, len = ref1.length; i < len; i++) {
            xflag = ref1[i];
            if (-1 === doc.flags.indexOf(xflag)) {
              xflag = '!' + xflag;
            }
            emit(['date', boxid, xflag, docDate], null);
          }
          if (((ref2 = doc.attachments) != null ? ref2.length : void 0) > 0) {
            emit(['date', boxid, '\\Attachments', docDate], null);
          }
          ref3 = doc.from;
          for (j = 0, len1 = ref3.length; j < len1; j++) {
            sender = ref3[j];
            if (sender.name != null) {
              emit(['from', boxid, null, sender.name, docDate], null);
            }
            emit(['from', boxid, null, sender.address, docDate], null);
          }
          dests = [];
          if (doc.to != null) {
            dests = dests.concat(doc.to);
          }
          if (doc.cc != null) {
            dests = dests.concat(doc.cc);
          }
          for (k = 0, len2 = dests.length; k < len2; k++) {
            dest = dests[k];
            if (dest.name != null) {
              emit(['dest', boxid, null, dest.name, docDate], null);
            }
            emit(['dest', boxid, null, dest.address, docDate], null);
          }
        }
        void 0;
        if (nobox) {
          return emit(['nobox']);
        }
      }
    },
    dedupRequest: function(doc) {
      if (doc.messageID) {
        emit([doc.accountID, 'mid', doc.messageID], doc.conversationID);
      }
      if (doc.normSubject) {
        return emit([doc.accountID, 'subject', doc.normSubject], doc.conversationID);
      }
    },
    conversationPatching: {
      reduce: function(key, values, rereduce) {
        var i, len, value, valuesShouldNotBe;
        valuesShouldNotBe = rereduce ? null : values[0];
        for (i = 0, len = values.length; i < len; i++) {
          value = values[i];
          if (value !== valuesShouldNotBe) {
            return value;
          }
        }
        return null;
      },
      map: function(doc) {
        var i, len, ref, reference, results;
        if (doc.messageID) {
          emit([doc.accountID, doc.messageID], doc.conversationID);
        }
        ref = doc.references || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          reference = ref[i];
          results.push(emit([doc.accountID, reference], doc.conversationID));
        }
        return results;
      }
    },
    byConversationID: {
      reduce: '_count',
      map: function(doc) {
        if (doc.conversationID && !doc.ignoreInCount) {
          return emit(doc.conversationID);
        }
      }
    }
  }
};
