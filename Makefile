build:
	$(MAKE) -C lib/lambdas build
	npm i
	npm run build

clean:
	$(MAKE) -C lib/lambdas clean
	rm -rf cdk.out
	rm -rf node_modules

diff:
	cdk diff

synth:
	cdk synth

deploy:
	cdk deploy --outputs-file ./cdk-outputs.json

destroy:
	cdk destroy
	$(MAKE) clean