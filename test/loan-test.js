const {expectRevert, time} = require('@openzeppelin/test-helpers');
const Loan = artifacts.require("Loan");

contract('Loan', (accounts) => {
  const [borrower, lender] = [accounts[1], accounts[2]];
  let loan;
  before(async () => {
    loan = await Loan.new(200, 2, borrower, {from: lender, value: 1000});
  });

  it('should fund ether', async () => {
    const balanceBefore = await web3.eth.getBalance(borrower);
    await loan.fund(1000, {from: lender});
    const balanceAfter = await web3.eth.getBalance(borrower);
    balanceAfterBN = web3.utils.toBN(balanceAfter);
    balanceBeforeBN = web3.utils.toBN(balanceBefore);
    const state = await loan.state();
    assert(balanceAfterBN.sub(balanceBeforeBN).toNumber() === 1000, 'funds didnt work');
    assert(state.toNumber() === 1, 'state NOT active');
  });

  it('should NOT fund if isnt lender', async () => {
    await expectRevert(
      loan.fund(1000, {from: borrower}),
      'only lender can lend'
    );
  });

  it('should NOT fund if isnt lend the exact amount', async () => {
    await expectRevert(
      loan.fund(500, {from: lender}),
      'can only lend the exact amount'
    );
  });

  it('should reimburse hasnt matured yet', async () => {
    await expectRevert(
      loan.reimburse({from: borrower, value: 1200}),
      'loan hasnt matured yet'
    );
  });

  it('should reimburse ether', async () => {
    await time.increase(2001);
    const balanceBefore = await web3.eth.getBalance(lender);
    await loan.reimburse({from: borrower, value: 1200});
    const balanceAfter = await web3.eth.getBalance(lender);
    balanceAfterBN = web3.utils.toBN(balanceAfter);
    balanceBeforeBN = web3.utils.toBN(balanceBefore);
    const state = await loan.state();
    assert(balanceAfterBN.sub(balanceBeforeBN).toNumber() === 1200, 'reimburse didnt work');
    assert(state.toNumber() === 2, 'state NOT closed');
  });

  it('should NOT reimburse exactly amount + interest', async () => {
    loan2 = await Loan.new(200, 2, borrower, {from: lender, value: 2000});
    await loan2.fund(2000, {from: lender});
    await expectRevert(
      loan2.reimburse({from: borrower, value: 1500}),
      'borrower need to reimburse exactly amount + interest'
    );
  });

});