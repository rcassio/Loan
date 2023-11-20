// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract Loan {
    enum State {
        PENDING,
        ACTIVE,
        CLOSED
    }

    State public state = State.PENDING;
    uint public amount;
    uint public interest;
    uint public end;
    address payable public borrower;
    address payable public lender;

    constructor (
        uint _interest,
        uint _duration,
        address payable _borrower
    ) payable {
      amount = msg.value;
      interest = _interest;
      end = block.timestamp + _duration;
      borrower = _borrower;
      lender = payable(msg.sender);
    }

    function fund(uint _amount) payable external {
        require(msg.sender == lender, 'only lender can lend');
        require(_amount == amount, 'can only lend the exact amount');
        _transitionTo(State.ACTIVE);
        borrower.transfer(amount);
    }

    function reimburse() payable external {
        require(msg.sender == borrower, 'only borrower can reimburse');
        require(msg.value == amount + interest, 'borrower need to reimburse exactly amount + interest');
        _transitionTo(State.CLOSED);
        lender.transfer(amount + interest);
    }

    function _transitionTo(State to) internal {
        require(to != State.PENDING, 'cannot go back to PENDING state');
        require(to != state, 'cannot transition to current state');
        if(to == State.ACTIVE) {
            require(state == State.PENDING, 'can only transition to active from pending state');
            state = State.ACTIVE;
        } else if(to == State.CLOSED) {
            require(state == State.ACTIVE, 'can only transition to closed from active');
            require(block.timestamp >= end, 'loan hasnt matured yet');
            state = State.CLOSED;
        }
    }
}