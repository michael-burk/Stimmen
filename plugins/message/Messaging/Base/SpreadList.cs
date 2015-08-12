using System;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.Serialization;
using System.Collections;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using VVVV.Nodes.Messaging;
using VVVV.PluginInterfaces.V2.NonGeneric;
using VVVV.Pack.Messaging;

namespace VVVV.Pack.Messaging.Collections
{
	/// <summary>
	/// Description of BundleOSCNode.
	/// </summary>
	[Serializable]
	[JsonConverter(typeof(SpreadListSerializer))]
	public class SpreadList : ArrayList, ISerializable
	{
        
        public Type SpreadType {
			get {
				if (this.Count == 0) return typeof(object);
					else return this[0].GetType();
			}
		}
		
		public SpreadList() : base()
		{
		}
		
		//		[SecurityPermissionAttribute(SecurityAction.Demand, SerializationFormatter = true)]
		public virtual void GetObjectData(SerializationInfo info, StreamingContext context)
		{
			for (int i=0;i<this.Count;i++)
			{
				info.AddValue(i.ToString(CultureInfo.InvariantCulture), this[i]);
				
			}
		}
		
		public void AssignFrom(IEnumerable source) {
			
			foreach (object o in source) {
				this.Add(o);
			}
			
		}
		
		public new SpreadList Clone() {
			SpreadList c = new SpreadList();
			c.AssignFrom(this);
			return c;
		}
	}
	
	
	public class SpreadListSerializer : JsonConverter
	{

        public SpreadListSerializer()
        {
        }
		
        
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
		{
			SpreadList list = value as SpreadList;
		    writer.WriteStartObject();
			writer.WritePropertyName("Type");
		    
			
			Type type = (list == null) || (list.Count == 0)? typeof(string) : list.SpreadType;

            writer.WriteValue(TypeIdentity.Instance[type]);
			
    		writer.WritePropertyName("Spread");
			writer.WriteStartArray();
			foreach (object o in list) {
				serializer.Serialize(writer, o);
			}
			writer.WriteEndArray();

			writer.WriteEndObject();
		}
		
		public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
		{
			SpreadList sl = new SpreadList();
			JObject jsonObject = JObject.Load(reader);
			string typeName = "string";
            
            var jT = jsonObject.GetValue("Type");
		    typeName = (string) jT.ToObject(typeof(string), serializer);

		    Type type = typeof (string);
            foreach (Type key in TypeIdentity.Instance.Keys)
		    {
                if (TypeIdentity.Instance[key] == typeName)
		        {
		            type = key;
		        }
		    }

            JArray jArray = (JArray) jsonObject.GetValue("Spread");

		    foreach (var o in jArray)
            {
                var instance = o.ToObject(type, serializer);
                sl.Add(instance);
            }
			return sl;
			
		}	
		
		public override bool CanConvert(Type objectType)
		{
			return typeof(SpreadList).IsAssignableFrom(objectType);
		}


	}
}
