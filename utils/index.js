const delay = async (waitTimeMS) => new Promise(resolve => setTimeout(resolve, waitTimeMS));

module.exports = {
    delay
};
