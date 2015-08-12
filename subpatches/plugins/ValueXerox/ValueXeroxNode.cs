#region usings

using System.ComponentModel.Composition;

using VVVV.PluginInterfaces.V1;
using VVVV.PluginInterfaces.V2;
using VVVV.Utils.VColor;
using VVVV.Utils.VMath;

using VVVV.Core.Logging;
#endregion usings

namespace VVVV.Nodes
{
	#region PluginInfo
	[PluginInfo(Name = "Xerox", Category = "Value", Help = "Basic template with one value in/out", Tags = "")]
	#endregion PluginInfo
	public class ValueXeroxNode : IPluginEvaluate
	{
		#region fields & pins
		[Input("Input", DefaultValue = 1.0)]
		public ISpread<double> FInput;

		[Output("Output")]
		public ISpread<double> FOutput;

		[Import()]
		public ILogger FLogger;
		#endregion fields & pins

		//called when data for any output pin is requested
		public void Evaluate(int SpreadMax)
		{
			FOutput.SliceCount = SpreadMax;
			
			HttpClient client = new HttpClient();
			FormUrlEncodedContent form = new FormUrlEncodedContent(new Dictionary<string, string> { { "username", "username" }, { "password", "password" } });
 
			Task<HttpResponseMessage> message = client.PostAsync("https://services.open.xerox.com/api/Auth/OAuth2", form);
			String result = message.Result.Content.ReadAsStringAsync().Result;
 
			JObject obj = JObject.Parse(result);
			string token = (string)obj["access_token"];
			string refreshToken = (string)obj["refresh_token"];
			
			
			
			for (int i = 0; i < SpreadMax; i++)
				FOutput[i] = FInput[i] * 2;

			//FLogger.Log(LogType.Debug, "hi tty!");
		}
	}
}
