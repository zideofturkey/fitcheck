const ClientClasses = {};

const ClientConfigs = {};

const clients = {};

const clientConstructors = {};

const createClient = (provider) => {
  if (!clientConstructors[provider]) return null;
  return clientConstructors[provider]();
};

const getIntegrationClient = async (provider) => {
  // in future this function may involve some awaited test calls inside
  // so it is planned async although it is just a constructor wrapper,
  clients[provider] = clients[provider] || createClient(provider);
  return clients[provider];
};

const testProvider = async (provider) => {
  if (!ClientClasses[provider]) return null;
  const Provider = ClientClasses[provider];
  return await Provider.test(ClientConfigs[provider]);
};

module.exports = { getIntegrationClient, testProvider };
