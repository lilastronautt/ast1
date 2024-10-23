const { parseRuleString, combineNodes, evaluate,printTree } = require('../utils/ast');
// let count=0;

let rulesArr = [];

function generateRandomLetterString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
  }

  return result;
}



exports.createRule = async (req, res) => {
  try {
    const { ruleName, ruleString } = req.body;
    if (!ruleName || !ruleString) {
      return res.status(400).json({ error: 'ruleName and ruleString are required' });
    }
    const rootNode = parseRuleString(ruleString);
    const rule = { ruleName, ruleAST: rootNode };
    // await rule.save();
    rulesArr.push(rule);
    console.log(rulesArr);
    printTree(rootNode);
    res.status(201).json(rule);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

exports.combineRules = async (req, res) => {
  try {
    const { rules ,op} = req.body;
    const ruleDocs = rulesArr.map((el) => {
      if(rules.includes(el.ruleName))
        return el;
    });
    if (ruleDocs.length === 0) {
      return res.status(404).json({ error: 'No matching rules found' });
    }
    const ruleASTs = ruleDocs.map(rule => rule.ruleAST);
    const combinedRootNode = combineNodes(ruleASTs,op);
    // Generate a 4-letter random string
    const randomString = generateRandomLetterString(4);
    const rule = { ruleName: `combined${randomString}`, ruleAST: combinedRootNode };
    //await rule.save();
    printTree(combinedRootNode);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.evaluateRule = async (req, res) => {
  try {
    const { ast, data } = req.body;
    const rule = rulesArr.map((el) => {
      if(el.ruleName == ast) {
        return el;
      }
    });
    
     // Log the fetched rule
    //  printTree(rule[0].ruleAST);
    //  console.log('Fetched rule:',rule,ast); // Debug line

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    const result = evaluate(rule[0].ruleAST, data);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};