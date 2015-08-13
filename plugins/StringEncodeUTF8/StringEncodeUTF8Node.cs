#region usings
using System;
using System.ComponentModel.Composition;

using System.Text;
using System.IO;
using System.Web;

using VVVV.PluginInterfaces.V1;
using VVVV.PluginInterfaces.V2;
using VVVV.Utils.VColor;
using VVVV.Utils.VMath;

using VVVV.Core.Logging;
#endregion usings

namespace VVVV.Nodes
{
	#region PluginInfo
	[PluginInfo(Name = "EncodeUTF8", Category = "String", Help = "Encode UTF-8 Strings", Tags = "", Author="nissidis")]
	#endregion PluginInfo
	public class StringEncodeUTF8Node : IPluginEvaluate
	{
		#region fields & pins
		[Input("Input", DefaultString = "Ξ“Ξ•ΞΞ•Ξ£Ξ™Ξ£")]
		ISpread<string> FInput;

		[Output("Output")]
		ISpread<string> FOutput;

		[Import()]
		ILogger FLogger;
		#endregion fields & pins
		
		 string word;
		
	
		//called when data for any output pin is requested
		public void Evaluate(int SpreadMax)
		{
			
		
			
			SpreadMax = FInput.SliceCount;
			
			FOutput.SliceCount = SpreadMax;
			
				
			
			for (int i = 0; i < SpreadMax; i++){
				// This is our Unicode string:
				word = FInput[i];
				
		byte[] bytes = Encoding.Default.GetBytes(word);
				word = Encoding.UTF8.GetString(bytes);
				FLogger.Log(LogType.Debug,SpreadMax.ToString());
				
				FOutput[i] = word;
			}
	
			
		}
		
	}
}
