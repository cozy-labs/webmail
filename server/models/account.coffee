americano = require 'americano-cozy'
module.exports = Account = americano.getModel 'Account',
    label: String
    login: String
    password: String
    smtpServer: String
    smtpPort: Number
    imapServer: String
    imapPort: Number
    mailboxes: (x) -> x
    draftMailbox: String
    sentMailbox: String
    trashMailbox: String


# There is a circular dependency between ImapProcess & Account
# node handle if we require after module.exports definition
Mailbox = require './mailbox'
ImapProcess = require '../processes/imap_processes'
Promise = require 'bluebird'
{WrongConfigError} = require '../utils/errors'
log = require('../utils/logging')(prefix: 'models:account')

# fetch the list of all Accounts
# include the account mailbox tree
Account.getAll = (callback) ->
    Account.request 'all', callback

# fetch the list of all Accounts
# include the account mailbox tree
Account.listWithMailboxes = ->
    Account.requestPromised 'all'
    .map (account) -> account.includeMailboxes()

# refresh all accounts
Account.refreshAllAccounts = ->
    Promise.serie Account.getAllPromised(), (account) ->
        ImapProcess.fetchAccount account

# refresh this account
Account::fetchMails = ->
    ImapProcess.fetchAccount this

# include the mailboxes tree on an account instance
# return a promise for the account itself
Account::includeMailboxes = ->
    Mailbox.getClientTree @id
    .then (mailboxes) =>
        @mailboxes = mailboxes
    .return this

# fetch the mailbox tree of a new ImapAccount
# if the fetch succeeds, create the account and mailbox in couch
Account.createIfValid = (data) ->
    account = null
    rawBoxesTree = null

    ImapProcess.fetchBoxesTree data
    .then (boxes) ->
        log.info "GOT BOXES", boxes
        # We managed to get boxes, login settings are OK
        # create Account and Mailboxes
        rawBoxesTree = boxes
        Account.createPromised data

    .then (created) ->
        account = created
        Mailbox.createBoxesFromImapTree account.id, rawBoxesTree

    .then ->
        log.info "CREATED ACCOUNT & BOXES"
        return account.includeMailboxes()


Promise.promisifyAll Account, suffix: 'Promised'
Promise.promisifyAll Account::, suffix: 'Promised'