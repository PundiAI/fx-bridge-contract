import chai, { expect } from "chai";
import {solidity} from "ethereum-waffle";
import {randPowerGenerator} from "../../scripts/utils/utils";

chai.use(solidity);

describe("util test", function () {
  it('randGenerator ', function () {

    const uinit32_max = parseInt('11111111111111111111111111111111', 2)
    const vote_power = Math.ceil(uinit32_max * 0.66); 

    const power = randPowerGenerator(100, uinit32_max);
    let total = 0;
    power.forEach( power => {
      total += power
    })

    

    expect(total).equal(uinit32_max)

  });
});
