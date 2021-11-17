import { expect } from "chai";
import { describe, it } from "mocha";
import { join } from "path";
import { pwned, disconnect, connect } from "../src";

describe(
	"pwned",
	() => {
        
        before(() => {
            const path = join(__dirname, "pwned_100000.sqlite3");
            connect(path);
        });

        after(() => {
            disconnect();
        });

		const cases: [string, boolean][] = [
			["123456", true],
			["Password", true],
			["secret", true],
			["P@ssword", true],
			["Was ist Aufklärung?", false],
		];
		cases.forEach(function ([value, isInTestDb]) {
			it(`should return ${isInTestDb} for '${value}'`, function () {
				expect(pwned(value), value).to.be.equal(isInTestDb);
			})
		});

		it('benchmark', () => {
			const start = Date.now();
			for (let i = 0, il = 50000; i <il; i++) {
				pwned("P@ssword");
				pwned("Was ist Aufklärung?");
			}
			const end = Date.now();

			console.log(`100000 pwned checks took ${end-start} ms`);
		});
	}
);
