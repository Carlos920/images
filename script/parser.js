module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
  const rawObj = yaml.parse(raw);
  const autoselect = {
    name: "♻️ 自动选择",
    type: "url-test",
    url: "http://www.gstatic.com/generate_204",
    interval: 300,
    tolerance: 100,
    proxies: rawObj["proxies"].map((a) => a.name),
  };
  rawObj["proxy-groups"].unshift(autoselect);
  rawObj["proxy-groups"][1]["proxies"].unshift(autoselect.name);

  return yaml.stringify({ ...rawObj });
};
